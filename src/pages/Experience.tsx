import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { experienceService } from '@/services/experience';
import { skillsService } from '@/services/skills';
import type { Experience, Skill } from '@/types';
import ExperienceItem from '@/components/items/ExperienceItem';

const experienceSchema = z.object({
    startYear: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 10),
    endYear: z.number().min(1900).max(new Date().getFullYear() + 10).nullable(),
    companyName: z.string().min(1, 'Company name is required'),
    description: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    skillIds: z.array(z.string()).optional(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

export default function ExperiencePage() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCurrentJob, setIsCurrentJob] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; experienceId: string | null }>({ open: false, experienceId: null });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
        setValue,
    } = useForm<ExperienceFormData>({
        resolver: zodResolver(experienceSchema),
        defaultValues: {
            skillIds: [],
            endYear: null,
        },
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [experiencesData, skillsData] = await Promise.all([
                experienceService.getAll(),
                skillsService.getAll(),
            ]);
            setExperiences(experiencesData);
            setSkills(skillsData);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (exp?: Experience) => {
        if (exp) {
            setEditingExperience(exp);
            setValue('startYear', exp.startYear);
            setValue('endYear', exp.endYear);
            setValue('companyName', exp.companyName);
            setValue('description', exp.description || '');
            setValue('location', exp.location);
            setValue('skillIds', exp.experienceSkills?.map(es => es.skill.id) || []);
            setIsCurrentJob(exp.endYear === null);
        } else {
            setEditingExperience(null);
            reset({
                startYear: new Date().getFullYear(),
                endYear: null,
                companyName: '',
                description: '',
                location: '',
                skillIds: [],
            });
            setIsCurrentJob(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExperience(null);
        reset();
        setIsCurrentJob(false);
    };

    const onSubmit = async (data: ExperienceFormData) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                endYear: isCurrentJob ? null : data.endYear,
            };

            if (editingExperience) {
                await experienceService.update(editingExperience.id, payload);
                toast.success('Experience updated successfully');
            } else {
                await experienceService.create(payload);
                toast.success('Experience created successfully');
            }

            await loadData();
            handleCloseModal();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDialog({ open: true, experienceId: id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.experienceId) return;

        try {
            await experienceService.delete(confirmDialog.experienceId);
            toast.success('Experience deleted successfully');
            await loadData();
        } catch (error) {
            toast.error('Failed to delete experience');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Experience</h1>
                        <p className="text-gray-400 mt-2">Manage your work experience</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Experience</span>
                    </Button>
                </div>
                <Input
                    type="search"
                    placeholder="Search experiences..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>

            {(() => {
                const filteredExperiences = experiences.filter(exp =>
                    exp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                return filteredExperiences.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                        <p className="text-gray-400">
                            {searchQuery ? 'No experiences found matching your search.' : 'No experience entries yet. Add your first one to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredExperiences.map((exp) => (
                            <ExperienceItem
                                key={exp.id}
                                experience={exp}
                                onEdit={handleOpenModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                );
            })()}

            <Modal
                open={isModalOpen}
                onOpenChange={handleCloseModal}
                title={editingExperience ? 'Edit Experience' : 'Add New Experience'}
                description={editingExperience ? 'Update experience information' : 'Create a new experience entry'}
                disabled={isSubmitting}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pr-3">
                    <Input
                        label="Company Name"
                        placeholder="e.g., Tech Corp"
                        disabled={isSubmitting}
                        error={errors.companyName?.message}
                        {...register('companyName')}
                    />

                    <Input
                        label="Location"
                        placeholder="e.g., San Francisco, CA"
                        disabled={isSubmitting}
                        error={errors.location?.message}
                        {...register('location')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Year"
                            type="number"
                            placeholder="2020"
                            disabled={isSubmitting}
                            error={errors.startYear?.message}
                            {...register('startYear', { valueAsNumber: true })}
                        />

                        <div>
                            <Input
                                label="End Year"
                                type="number"
                                placeholder="2023"
                                disabled={isCurrentJob || isSubmitting}
                                error={errors.endYear?.message}
                                {...register('endYear', {
                                    valueAsNumber: true,
                                    setValueAs: (v) => v === '' ? null : Number(v)
                                })}
                            />
                            <label className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={isCurrentJob}
                                    onChange={(e) => {
                                        setIsCurrentJob(e.target.checked);
                                        if (e.target.checked) {
                                            setValue('endYear', null);
                                        }
                                    }}
                                    className="rounded border-gray-600 text-primary-600 focus:ring-primary-600"
                                />
                                Currently working here
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            className="flex w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                            placeholder="Describe your role and responsibilities..."
                            disabled={isSubmitting}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Skills
                        </label>
                        <Controller
                            name="skillIds"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => {
                                        const isSelected = field.value?.includes(skill.id);
                                        return (
                                            <button
                                                key={skill.id}
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={() => {
                                                    const newValue = isSelected
                                                        ? (field.value || []).filter(id => id !== skill.id)
                                                        : [...(field.value || []), skill.id];
                                                    field.onChange(newValue);
                                                }}
                                                className={`
                                                    px-4 py-2 rounded-full text-sm font-medium transition-all
                                                    ${isSelected
                                                        ? 'bg-primary-600 text-white border-2 border-primary-600 shadow-lg shadow-primary-600/30'
                                                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                                                    }
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                `}
                                            >
                                                {skill.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-gray-900 pb-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {editingExperience ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>{editingExperience ? 'Update' : 'Create'}</>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, experienceId: null })}
                onConfirm={confirmDelete}
                title="Delete Experience"
                message="Are you sure you want to delete this experience? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { skillsService } from '@/services/skills';
import type { Skill } from '@/types';
import { compressImage } from '@/lib/imageCompression';
import SkillItem from '@/components/items/SkillItem';

const skillSchema = z.object({
    name: z.string().min(1, 'Skill name is required'),
    icon: z.any(),
});

type SkillFormData = z.infer<typeof skillSchema>;

export default function Skills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; skillId: string | null }>({ open: false, skillId: null });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
    } = useForm<SkillFormData>({
        resolver: zodResolver(skillSchema),
    });

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        try {
            const data = await skillsService.getAll();
            setSkills(data);
        } catch (error) {
            toast.error('Failed to load skills');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (skill?: Skill) => {
        if (skill) {
            setEditingSkill(skill);
            setValue('name', skill.name);
            setIconPreview(skill.icon);
        } else {
            setEditingSkill(null);
            reset();
            setIconPreview(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSkill(null);
        reset();
        setIconPreview(null);
    };

    const onSubmit = async (data: SkillFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);

            if (data.icon && data.icon[0]) {
                const compressedIcon = await compressImage(data.icon[0]);
                formData.append('icon', compressedIcon);
            } else if (!editingSkill) {
                toast.error('Icon is required for new skills');
                return;
            }

            if (editingSkill) {
                await skillsService.update(editingSkill.id, formData);
                toast.success('Skill updated successfully');
            } else {
                await skillsService.create(formData);
                toast.success('Skill created successfully');
            }

            await loadSkills();
            handleCloseModal();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDialog({ open: true, skillId: id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.skillId) return;

        try {
            await skillsService.delete(confirmDialog.skillId);
            toast.success('Skill deleted successfully');
            await loadSkills();
        } catch (error) {
            toast.error('Failed to delete skill');
        }
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
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
                        <h1 className="text-3xl font-bold text-white">Skills</h1>
                        <p className="text-gray-400 mt-2">Manage your skills library</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Skill</span>
                    </Button>
                </div>
                <Input
                    type="search"
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>

            {(() => {
                const filteredSkills = skills.filter(skill =>
                    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                return filteredSkills.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                        <p className="text-gray-400">
                            {searchQuery ? 'No skills found matching your search.' : 'No skills yet. Add your first skill to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredSkills.map((skill) => (
                            <SkillItem
                                key={skill.id}
                                skill={skill}
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
                title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
                description={editingSkill ? 'Update skill information' : 'Create a new skill'}
                disabled={isSubmitting}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Skill Name"
                        placeholder="e.g., TypeScript"
                        disabled={isSubmitting}
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Icon
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            disabled={isSubmitting}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            {...register('icon')}
                            onChange={handleIconChange}
                        />
                        {errors.icon && (
                            <p className="mt-1.5 text-sm text-red-500">{errors.icon.message as string}</p>
                        )}
                        {!editingSkill && (
                            <p className="mt-1 text-xs text-gray-500">Icon is required for new skills</p>
                        )}
                        {iconPreview && (
                            <div className="mt-3">
                                <img
                                    src={iconPreview}
                                    alt="Preview"
                                    className="w-16 h-16 object-contain rounded border border-gray-700"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
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
                                    {editingSkill ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>{editingSkill ? 'Update' : 'Create'}</>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, skillId: null })}
                onConfirm={confirmDelete}
                title="Delete Skill"
                message="Are you sure you want to delete this skill? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}

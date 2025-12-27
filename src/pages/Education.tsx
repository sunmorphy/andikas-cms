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
import { educationService } from '@/services/education';
import type { Education } from '@/types';
import EducationItem from '@/components/items/EducationItem';

const educationSchema = z.object({
    year: z.string().min(1, 'Year is required'),
    institutionName: z.string().min(1, 'Institution name is required'),
    description: z.string().optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

export default function EducationPage() {
    const [education, setEducation] = useState<Education[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; educationId: string | null }>({ open: false, educationId: null });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
    } = useForm<EducationFormData>({
        resolver: zodResolver(educationSchema),
    });

    useEffect(() => {
        loadEducation();
    }, []);

    const loadEducation = async () => {
        try {
            const data = await educationService.getAll();
            setEducation(data);
        } catch (error) {
            toast.error('Failed to load education');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (edu?: Education) => {
        if (edu) {
            setEditingEducation(edu);
            setValue('year', edu.year);
            setValue('institutionName', edu.institutionName);
            setValue('description', edu.description || '');
        } else {
            setEditingEducation(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEducation(null);
        reset();
    };

    const onSubmit = async (data: EducationFormData) => {
        setIsSubmitting(true);
        try {
            if (editingEducation) {
                await educationService.update(editingEducation.id, data);
                toast.success('Education updated successfully');
            } else {
                await educationService.create(data);
                toast.success('Education created successfully');
            }

            await loadEducation();
            handleCloseModal();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDialog({ open: true, educationId: id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.educationId) return;

        try {
            await educationService.delete(confirmDialog.educationId);
            toast.success('Education deleted successfully');
            await loadEducation();
        } catch (error) {
            toast.error('Failed to delete education');
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
                        <h1 className="text-3xl font-bold text-white">Education</h1>
                        <p className="text-gray-400 mt-2">Manage your educational background</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Education</span>
                    </Button>
                </div>
                <Input
                    type="search"
                    placeholder="Search education..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>

            {(() => {
                const filteredEducation = education.filter(edu =>
                    edu.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (edu.description && edu.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                return filteredEducation.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                        <p className="text-gray-400">
                            {searchQuery ? 'No education entries found matching your search.' : 'No education entries yet. Add your first one to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEducation.map((edu) => (
                            <EducationItem
                                key={edu.id}
                                education={edu}
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
                title={editingEducation ? 'Edit Education' : 'Add New Education'}
                description={editingEducation ? 'Update education information' : 'Create a new education entry'}
                disabled={isSubmitting}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Year"
                        placeholder="e.g., 2015-2019"
                        disabled={isSubmitting}
                        error={errors.year?.message}
                        {...register('year')}
                    />

                    <Input
                        label="Institution Name"
                        placeholder="e.g., University of Technology"
                        disabled={isSubmitting}
                        error={errors.institutionName?.message}
                        {...register('institutionName')}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            className="flex w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                            placeholder="e.g., Bachelor of Science in Computer Science"
                            disabled={isSubmitting}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-sm text-red-500">{errors.description.message}</p>
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
                                    {editingEducation ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>{editingEducation ? 'Update' : 'Create'}</>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, educationId: null })}
                onConfirm={confirmDelete}
                title="Delete Education"
                message="Are you sure you want to delete this education entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectItem from '@/components/items/ProjectItem';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { projectsService } from '@/services/projects';
import { skillsService } from '@/services/skills';
import type { Project, Skill } from '@/types';
import { format } from 'date-fns';
import { compressImage } from '@/lib/imageCompression';

const projectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
    description: z.string().min(1, 'Description is required'),
    content: z.string().min(1, 'Content is required'),
    coverImage: z.any().optional(),
    contentImages: z.any().optional(),
    publishedAt: z.string().optional(),
    published: z.boolean().optional(),
    skillIds: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [previewFiles, setPreviewFiles] = useState<File[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; projectId: string | null }>({ open: false, projectId: null });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            content: '',
            skillIds: [],
        },
    });

    const titleValue = watch('title');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (titleValue && !editingProject) {
            const slug = titleValue
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setValue('slug', slug);
        }
    }, [titleValue, editingProject, setValue]);

    const loadData = async () => {
        try {
            const [projectsData, skillsData] = await Promise.all([
                projectsService.getAll(),
                skillsService.getAll(),
            ]);
            setProjects(projectsData);
            setSkills(skillsData);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (project?: Project) => {
        if (project) {
            setEditingProject(project);
            setValue('title', project.title);
            setValue('slug', project.slug);
            setValue('description', project.description);
            setValue('content', project.content);
            setValue('publishedAt', project.publishedAt ? format(new Date(project.publishedAt), 'yyyy-MM-dd') : '');
            setValue('published', (project as any).published || false);
            setValue('skillIds', project.projectSkills?.map(ps => ps.skill.id) || []);
            setCoverPreview(project.coverImage);
            setPreviewImages(project.contentImages || []);
            setPreviewFiles([]);
        } else {
            setEditingProject(null);
            reset({
                title: '',
                slug: '',
                description: '',
                content: '',
                publishedAt: '',
                published: false,
                skillIds: [],
            });
            setCoverPreview(null);
            setPreviewImages([]);
            setPreviewFiles([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        reset();
        setCoverPreview(null);
        setPreviewImages([]);
        setPreviewFiles([]);
    };

    const onSubmit = async (data: ProjectFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('slug', data.slug);
            formData.append('description', data.description);
            formData.append('content', data.content);

            formData.append('published', data.published ? 'true' : 'false');

            if (data.published) {
                formData.append('publishedAt', new Date().toISOString());
            }

            if (data.skillIds && data.skillIds.length > 0) {
                data.skillIds.forEach(skillId => {
                    formData.append('skillIds[]', skillId);
                });
            }

            if (data.coverImage && data.coverImage[0]) {
                const compressedCover = await compressImage(data.coverImage[0]);
                formData.append('coverImage', compressedCover);
            }

            if (editingProject) {
                const existingImageCount = editingProject.contentImages?.length || 0;
                const existingImagesToKeep = previewImages.slice(0, existingImageCount);

                formData.append('existingContentImages', JSON.stringify(existingImagesToKeep));
            }

            if (previewFiles.length > 0) {
                for (const file of previewFiles) {
                    const compressedFile = await compressImage(file);
                    formData.append('contentImages', compressedFile);
                }
            }

            if (editingProject) {
                await projectsService.update(editingProject.id, formData);
                toast.success('Project updated successfully');
            } else {
                await projectsService.create(formData);
                toast.success('Project created successfully');
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
        setConfirmDialog({ open: true, projectId: id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.projectId) return;

        try {
            await projectsService.delete(confirmDialog.projectId);
            toast.success('Project deleted successfully');
            await loadData();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePreviewImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setPreviewFiles(prev => [...prev, ...files]);

        const newPreviews: string[] = [];
        for (const file of files) {
            const reader = new FileReader();
            await new Promise<void>((resolve) => {
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const handleRemovePreviewImage = (index: number) => {
        const existingImageCount = editingProject?.contentImages?.length || 0;

        if (index < existingImageCount) {
            setPreviewImages(prev => prev.filter((_, i) => i !== index));
        } else {
            const newFileIndex = index - existingImageCount;
            setPreviewImages(prev => prev.filter((_, i) => i !== index));
            setPreviewFiles(prev => prev.filter((_, i) => i !== newFileIndex));
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
                        <h1 className="text-3xl font-bold text-white">Projects</h1>
                        <p className="text-gray-400 mt-2">Manage your portfolio projects</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Project</span>
                    </Button>
                </div>
                <Input
                    type="search"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>

            {(() => {
                const filteredProjects = projects.filter(project =>
                    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.projectSkills?.some(ps => ps.skill.name.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                return filteredProjects.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                        <p className="text-gray-400">
                            {searchQuery ? 'No projects found matching your search.' : 'No projects yet. Create your first project to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <ProjectItem
                                key={project.id}
                                project={project}
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
                title={editingProject ? 'Edit Project' : 'Add New Project'}
                description={editingProject ? 'Update project information' : 'Create a new project'}
                disabled={isSubmitting}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pr-3">
                    <Input
                        label="Title"
                        placeholder="e.g., E-Commerce Platform"
                        disabled={isSubmitting}
                        error={errors.title?.message}
                        {...register('title')}
                    />

                    <Input
                        label="Slug"
                        placeholder="e-commerce-platform"
                        disabled={isSubmitting}
                        error={errors.slug?.message}
                        {...register('slug')}
                    />

                    <Input
                        label="Description"
                        placeholder="Brief description of the project"
                        disabled={isSubmitting}
                        error={errors.description?.message}
                        {...register('description')}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Content
                        </label>
                        <Controller
                            name="content"
                            control={control}
                            render={({ field }) => (
                                <RichTextEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                    placeholder="Write your project content..."
                                />
                            )}
                        />
                        {errors.content && (
                            <p className="mt-1.5 text-sm text-red-500">{errors.content.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Cover Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            disabled={isSubmitting}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            {...register('coverImage')}
                            onChange={handleCoverChange}
                        />
                        {coverPreview && (
                            <div className="mt-3">
                                <img
                                    src={coverPreview}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded border border-gray-700"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Previews
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isSubmitting}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onChange={handlePreviewImagesChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Upload multiple images to showcase your project. Images will be compressed automatically.
                        </p>
                        {previewImages.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {previewImages.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded border border-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePreviewImage(index)}
                                            disabled={isSubmitting}
                                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="published"
                            disabled={isSubmitting}
                            {...register('published')}
                            className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <label htmlFor="published" className="text-sm font-medium text-gray-300">
                            Mark as Published
                        </label>
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
                                    {editingProject ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>{editingProject ? 'Update' : 'Create'}</>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, projectId: null })}
                onConfirm={confirmDelete}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}

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
import CertificationItem from '@/components/items/CertificationItem';
import { certificationsService } from '@/services/certifications';
import { skillsService } from '@/services/skills';
import type { Certification, Skill } from '@/types';

const certificationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    issuingOrganization: z.string().min(1, 'Issuing organization is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 10),
    description: z.string().optional(),
    certificateLink: z.string().url('Invalid URL').optional().or(z.literal('')),
    skillIds: z.array(z.string()).optional(),
});

type CertificationFormData = z.infer<typeof certificationSchema>;

export default function CertificationsPage() {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; certificationId: string | null }>({ open: false, certificationId: null });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
        setValue,
    } = useForm<CertificationFormData>({
        resolver: zodResolver(certificationSchema),
        defaultValues: {
            skillIds: [],
            certificateLink: '',
        },
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [certificationsData, skillsData] = await Promise.all([
                certificationsService.getAll(),
                skillsService.getAll(),
            ]);
            setCertifications(certificationsData);
            setSkills(skillsData);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (cert?: Certification) => {
        if (cert) {
            setEditingCertification(cert);
            setValue('name', cert.name);
            setValue('issuingOrganization', cert.issuingOrganization);
            setValue('year', cert.year);
            setValue('description', cert.description || '');
            setValue('certificateLink', cert.certificateLink || '');
            setValue('skillIds', cert.certificationSkills?.map(cs => cs.skill.id) || []);
        } else {
            setEditingCertification(null);
            reset({
                name: '',
                issuingOrganization: '',
                year: new Date().getFullYear(),
                description: '',
                certificateLink: '',
                skillIds: [],
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCertification(null);
        reset();
    };

    const onSubmit = async (data: CertificationFormData) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                certificateLink: data.certificateLink || undefined,
            };

            if (editingCertification) {
                await certificationsService.update(editingCertification.id, payload);
                toast.success('Certification updated successfully');
            } else {
                await certificationsService.create(payload);
                toast.success('Certification created successfully');
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
        setConfirmDialog({ open: true, certificationId: id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.certificationId) return;

        try {
            await certificationsService.delete(confirmDialog.certificationId);
            toast.success('Certification deleted successfully');
            await loadData();
        } catch (error) {
            toast.error('Failed to delete certification');
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
                        <h1 className="text-3xl font-bold text-white">Certifications</h1>
                        <p className="text-gray-400 mt-2">Manage your professional certifications</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Certification</span>
                    </Button>
                </div>
                <Input
                    type="search"
                    placeholder="Search certifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>

            {(() => {
                const filteredCertifications = certifications.filter(cert =>
                    cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    cert.issuingOrganization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (cert.description && cert.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                return filteredCertifications.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                        <p className="text-gray-400">
                            {searchQuery ? 'No certifications found matching your search.' : 'No certifications yet. Add your first one to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCertifications.map((cert) => (
                            <CertificationItem
                                key={cert.id}
                                certification={cert}
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
                title={editingCertification ? 'Edit Certification' : 'Add New Certification'}
                description={editingCertification ? 'Update certification information' : 'Create a new certification entry'}
                disabled={isSubmitting}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pr-3">
                    <Input
                        label="Certification Name"
                        placeholder="e.g., AWS Certified Solutions Architect"
                        disabled={isSubmitting}
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <Input
                        label="Issuing Organization"
                        placeholder="e.g., Amazon Web Services"
                        disabled={isSubmitting}
                        error={errors.issuingOrganization?.message}
                        {...register('issuingOrganization')}
                    />

                    <Input
                        label="Year"
                        type="number"
                        placeholder="2023"
                        disabled={isSubmitting}
                        error={errors.year?.message}
                        {...register('year', { valueAsNumber: true })}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            className="flex w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                            placeholder="Describe the certification..."
                            disabled={isSubmitting}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <Input
                        label="Certificate Link (Optional)"
                        type="url"
                        placeholder="https://..."
                        disabled={isSubmitting}
                        error={errors.certificateLink?.message}
                        {...register('certificateLink')}
                    />

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
                                    {editingCertification ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>{editingCertification ? 'Update' : 'Create'}</>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, certificationId: null })}
                onConfirm={confirmDelete}
                title="Delete Certification"
                message="Are you sure you want to delete this certification? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}

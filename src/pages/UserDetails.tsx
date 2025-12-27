import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, Loader2, User as UserIcon, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { userDetailsService } from '@/services/userDetails';
import type { UserDetails } from '@/types';
import { compressImage } from '@/lib/imageCompression';

const userDetailsSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().min(1, 'Role is required'),
    description: z.string().optional(),
    profilePhoto: z.any().optional(),
});

type UserDetailsFormData = z.infer<typeof userDetailsSchema>;

export default function UserDetailsPage() {
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [socialMedias, setSocialMedias] = useState<string[]>([]);
    const [newSocialMediaIcon, setNewSocialMediaIcon] = useState('');
    const [newSocialMediaUrl, setNewSocialMediaUrl] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<UserDetailsFormData>({
        resolver: zodResolver(userDetailsSchema),
    });

    useEffect(() => {
        loadUserDetails();
    }, []);

    const loadUserDetails = async () => {
        try {
            const data = await userDetailsService.get();
            if (data) {
                setUserDetails(data);
                setValue('name', data.name);
                setValue('role', data.role);
                setValue('description', data.description || '');
                setSocialMedias(data.socialMedias || []);
                setPhotoPreview(data.profilePhoto);
            }
        } catch (error) {
            toast.error('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: UserDetailsFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('role', data.role);
            if (data.description) {
                formData.append('description', data.description);
            }

            socialMedias.forEach((link) => {
                formData.append('socialMedias', link);
            });

            if (data.profilePhoto && data.profilePhoto[0]) {
                const compressedPhoto = await compressImage(data.profilePhoto[0]);
                formData.append('profilePhoto', compressedPhoto);
            }

            if (userDetails) {
                await userDetailsService.update(formData);
                toast.success('User details updated successfully');
            } else {
                await userDetailsService.create(formData);
                toast.success('User details created successfully');
            }

            await loadUserDetails();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSocialMedia = () => {
        if (newSocialMediaIcon.trim() && newSocialMediaUrl.trim()) {
            const formattedLink = `${newSocialMediaIcon.trim()}|${newSocialMediaUrl.trim()}`;
            setSocialMedias([...socialMedias, formattedLink]);
            setNewSocialMediaIcon('');
            setNewSocialMediaUrl('');
        }
    };

    const handleRemoveSocialMedia = (index: number) => {
        setSocialMedias(socialMedias.filter((_, i) => i !== index));
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
                <h1 className="text-3xl font-bold text-white">User Details</h1>
                <p className="text-gray-400 mt-2">Manage your profile information</p>
            </div>

            <div className="max-w-3xl">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Profile Photo
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="w-12 h-12 text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={isSubmitting}
                                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        {...register('profilePhoto')}
                                        onChange={handlePhotoChange}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Recommended: Square image, at least 400x400px
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Input
                            label="Name"
                            placeholder="e.g., John Doe"
                            disabled={isSubmitting}
                            error={errors.name?.message}
                            {...register('name')}
                        />

                        <Input
                            label="Role"
                            placeholder="e.g., Full Stack Developer"
                            disabled={isSubmitting}
                            error={errors.role?.message}
                            {...register('role')}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Description
                            </label>
                            <textarea
                                className="flex w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                                placeholder="Tell us about yourself..."
                                disabled={isSubmitting}
                                {...register('description')}
                            />
                            {errors.description && (
                                <p className="mt-1.5 text-sm text-red-500">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Social Media Links
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Add social media links with Phosphor icons (e.g., github-logo, linkedin-logo, twitter-logo)
                            </p>

                            <div className="space-y-2 mb-3">
                                {socialMedias.map((link, index) => {
                                    const [icon, url] = link.split('|');
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded"
                                        >
                                            <i className={`ph ph-${icon} text-xl text-gray-300`}></i>
                                            <span className="flex-1 text-sm text-gray-300 truncate">{url}</span>
                                            <button
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={() => handleRemoveSocialMedia(index)}
                                                className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-3">
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-400 mb-1">Icon Name</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={newSocialMediaIcon}
                                                disabled={isSubmitting}
                                                onChange={(e) => setNewSocialMediaIcon(e.target.value)}
                                                placeholder="github-logo"
                                                className="flex-1 h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            {newSocialMediaIcon && (
                                                <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded border border-gray-700">
                                                    <i className={`ph ph-${newSocialMediaIcon} text-xl text-gray-300`}></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">URL</label>
                                    <input
                                        type="url"
                                        value={newSocialMediaUrl}
                                        disabled={isSubmitting}
                                        onChange={(e) => setNewSocialMediaUrl(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSocialMedia();
                                            }
                                        }}
                                        placeholder="https://github.com/username"
                                        className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddSocialMedia}
                                    variant="outline"
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Social Media
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {userDetails ? 'Update Profile' : 'Create Profile'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                    <h3 className="text-blue-400 font-medium mb-2">Social Media Icons</h3>
                    <p className="text-sm text-gray-400">
                        Use Phosphor icon names from{' '}
                        <a
                            href="https://phosphoricons.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                        >
                            phosphoricons.com
                        </a>
                        . Common examples: GithubLogo, LinkedinLogo, TwitterLogo, Globe, Envelope
                    </p>
                </div>
            </div>
        </div>
    );
}

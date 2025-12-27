import { Pencil, Trash2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Experience } from '@/types';

interface ExperienceItemProps {
    experience: Experience;
    onEdit: (experience: Experience) => void;
    onDelete: (id: string) => void;
}

export default function ExperienceItem({ experience, onEdit, onDelete }: ExperienceItemProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                </div>

                <div className="min-w-0">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">{experience.companyName}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        {experience.location} • {experience.startYear} - {experience.endYear || 'Present'}
                    </p>
                    {experience.description && (
                        <p className="text-gray-300 mt-2 line-clamp-1">{experience.description}</p>
                    )}

                    {experience.experienceSkills && experience.experienceSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {experience.experienceSkills.map((es) => (
                                <span
                                    key={es.skill.id}
                                    className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700"
                                >
                                    {es.skill.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(experience)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(experience.id)}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { Pencil, Trash2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Education } from '@/types';

interface EducationItemProps {
    education: Education;
    onEdit: (education: Education) => void;
    onDelete: (id: string) => void;
}

export default function EducationItem({ education, onEdit, onDelete }: EducationItemProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>

                <div className="min-w-0">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">{education.institutionName}</h3>
                    <p className="text-gray-400 text-sm mt-1">{education.year}</p>
                    {education.description && (
                        <p className="text-gray-300 mt-2 line-clamp-1">{education.description}</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(education)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(education.id)}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

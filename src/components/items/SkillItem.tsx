import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Skill } from '@/types';

interface SkillItemProps {
    skill: Skill;
    onEdit: (skill: Skill) => void;
    onDelete: (id: string) => void;
}

export default function SkillItem({ skill, onEdit, onDelete }: SkillItemProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-primary-600 transition-colors flex flex-col min-h-[200px]">
            <div className="flex-1 flex items-center justify-center p-6">
                {skill.icon && (
                    <img
                        src={skill.icon}
                        alt={skill.name}
                        className="w-16 h-16 object-contain"
                    />
                )}
            </div>
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <h3 className="text-white font-medium text-center text-sm mb-3 line-clamp-2">{skill.name}</h3>
                <div className="flex gap-2 justify-center">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(skill)}
                        className="text-gray-400 hover:text-primary-400"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(skill.id)}
                        className="text-gray-400 hover:text-red-400"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

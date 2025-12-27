import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Project } from '@/types';
import { format } from 'date-fns';

interface ProjectItemProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

export default function ProjectItem({ project, onEdit, onDelete }: ProjectItemProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
            {project.coverImage && (
                <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                />
            )}
            <div className="p-6">
                <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                    <div className="min-w-0">
                        <h3 className="text-white font-semibold text-lg line-clamp-2">{project.title}</h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-1">{project.description}</p>
                        {project.publishedAt && (
                            <p className="text-gray-500 text-xs mt-2">
                                {format(new Date(project.publishedAt), 'MMMM dd, yyyy')}
                            </p>
                        )}

                        {project.projectSkills && project.projectSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {project.projectSkills.map((ps) => (
                                    <span
                                        key={ps.skill.id}
                                        className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700"
                                    >
                                        {ps.skill.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(project)}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(project.id)}
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

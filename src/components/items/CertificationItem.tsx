import { Pencil, Trash2, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Certification } from '@/types';

interface CertificationItemProps {
    certification: Certification;
    onEdit: (certification: Certification) => void;
    onDelete: (id: string) => void;
}

export default function CertificationItem({ certification, onEdit, onDelete }: CertificationItemProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                </div>

                <div className="min-w-0">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">{certification.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        {certification.issuingOrganization} • {certification.year}
                    </p>
                    {certification.description && (
                        <p className="text-gray-300 mt-2 line-clamp-1">{certification.description}</p>
                    )}
                    {certification.certificateLink && (
                        <a
                            href={certification.certificateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
                        >
                            View Certificate →
                        </a>
                    )}

                    {certification.certificationSkills && certification.certificationSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {certification.certificationSkills.map((cs) => (
                                <span
                                    key={cs.skill.id}
                                    className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700"
                                >
                                    {cs.skill.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(certification)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(certification.id)}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

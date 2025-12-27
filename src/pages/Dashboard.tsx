import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import {
    User,
    Briefcase,
    GraduationCap,
    Award,
    FolderKanban,
    Wrench
} from 'lucide-react';

const stats = [
    { name: 'User Details', icon: User, href: '/user-details', color: 'bg-blue-600' },
    { name: 'Skills', icon: Wrench, href: '/skills', color: 'bg-green-600' },
    { name: 'Experience', icon: Briefcase, href: '/experience', color: 'bg-purple-600' },
    { name: 'Education', icon: GraduationCap, href: '/education', color: 'bg-yellow-600' },
    { name: 'Certifications', icon: Award, href: '/certifications', color: 'bg-red-600' },
    { name: 'Projects', icon: FolderKanban, href: '/projects', color: 'bg-indigo-600' },
];

export default function Dashboard() {
    const user = useAuthStore((state) => state.user);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Welcome back, {user?.username}!</h1>
                <p className="text-gray-400 mt-2">Manage your portfolio content from here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Link
                        key={stat.name}
                        to={stat.href}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{stat.name}</h3>
                                <p className="text-sm text-gray-400">Manage {stat.name.toLowerCase()}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

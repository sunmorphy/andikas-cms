import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Briefcase,
    GraduationCap,
    Award,
    FolderKanban,
    Wrench,
    LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'User Details', href: '/user-details', icon: User },
    { name: 'Skills', href: '/skills', icon: Wrench },
    { name: 'Experience', href: '/experience', icon: Briefcase },
    { name: 'Education', href: '/education', icon: GraduationCap },
    { name: 'Certifications', href: '/certifications', icon: Award },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
];

export default function Sidebar() {
    const { user, logout } = useAuthStore();

    return (
        <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-white">Portfolio CMS</h1>
                <p className="text-sm text-gray-400 mt-1">Content Management</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/'}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, User, LogOut } from 'lucide-react';

interface AppDockProps {
    onHoverChange?: (isHovered: boolean) => void;
}

export function AppDock({ onHoverChange }: AppDockProps) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navItems = [
        {
            label: 'Generator',
            icon: Home,
            onClick: () => navigate('/generator'),
            isActive: location.pathname === '/generator',
        },
        {
            label: 'Dashboard',
            icon: LayoutGrid,
            onClick: () => navigate('/dashboard'),
            isActive: location.pathname.startsWith('/dashboard'),
        },
        {
            label: 'Profile',
            icon: User,
            onClick: () => navigate('/profile'),
            isActive: location.pathname === '/profile',
        },
    ];

    return (
        <div
            className="fixed left-4 top-1/2 -translate-y-1/2 z-[100]"
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={() => onHoverChange?.(false)}
        >
            {/* Invisible container to prevent jitter */}
            <div className="absolute inset-0 -left-4 -right-12 -top-12 -bottom-12 z-[-1]" />

            <Dock
                direction="vertical"
                magnification={100}
                distance={140}
                className=""
            >
                {navItems.map((item) => (
                    <DockItem key={item.label} className="aspect-square rounded-full bg-neutral-900 border border-white/10 shadow-lg">
                        <DockLabel>{item.label}</DockLabel>
                        <DockIcon>
                            <item.icon
                                className={`h-full w-full p-3 ${item.isActive ? 'text-white' : 'text-neutral-400'}`}
                                onClick={item.onClick}
                            />
                        </DockIcon>
                    </DockItem>
                ))}

                <div className="my-2 h-px w-full bg-transparent" />

                <DockItem className="aspect-square rounded-full bg-neutral-900 border border-white/10 shadow-lg">
                    <DockLabel>Logout</DockLabel>
                    <DockIcon>
                        <LogOut className="h-full w-full p-3 text-red-400" onClick={handleLogout} />
                    </DockIcon>
                </DockItem>
            </Dock>
        </div>
    );
}

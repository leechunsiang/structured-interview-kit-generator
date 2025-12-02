import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, User, LogOut } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { useAuth } from '@/components/AuthProvider';
import MatrixText from '@/components/kokonutui/matrix-text';
import { Link } from 'react-router-dom';

export function AppDock() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            navigate('/');
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navItems = [
        {
            title: 'Generator',
            icon: Home,
            onClick: () => navigate('/generator'),
            isActive: location.pathname === '/generator',
        },
        {
            title: 'Dashboard',
            icon: LayoutGrid,
            onClick: () => navigate('/dashboard'),
            isActive: location.pathname.startsWith('/dashboard'),
        },
        {
            title: 'Profile',
            icon: User,
            onClick: () => navigate('/profile'),
            isActive: location.pathname === '/profile',
        },
    ];

    return (
        <div className='fixed top-0 left-0 right-0 z-50 border-b bg-background'>
            <div className='relative flex items-center justify-between px-6 h-20'>
                {/* Logo, Text, and Subtitle on Left */}
                <div className="flex items-center gap-4">
                    <Link to="/generator" className="flex items-center gap-3 transition-all hover:opacity-80">
                        <img src="/kadoshAI_logo.png" alt="kadoshAI Logo" className="h-8 w-auto" />
                        <div className="flex items-center gap-2">
                            <div style={{ fontWeight: 900, WebkitTextStroke: '0.5px currentColor' }}>
                                <MatrixText
                                    text="Kadosh"
                                    className="!min-h-0 text-4xl font-black font-['Work_Sans']"
                                    letterAnimationDuration={300}
                                    initialDelay={0}
                                />
                            </div>
                            <div style={{ fontWeight: 900, WebkitTextStroke: '0.5px currentColor' }}>
                                <MatrixText
                                    text="AI"
                                    className="!min-h-0 text-4xl font-black text-[#6DE2B5] font-['Work_Sans']"
                                    letterAnimationDuration={300}
                                    initialDelay={300}
                                />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Centered Title */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-foreground tracking-tight">
                    Structured Interview Kit Generator
                </div>

                {/* Navigation Dock and Logout on Right */}
                <div className='flex items-center gap-2'>
                    <Dock className='items-center'>
                        {navItems.map((item) => (
                            <DockItem
                                key={item.title}
                                className='aspect-square rounded-full bg-neutral-800 border border-white/10'
                            >
                                <DockLabel>{item.title}</DockLabel>
                                <DockIcon>
                                    <item.icon
                                        className={`h-full w-full cursor-pointer ${item.isActive
                                            ? 'text-blue-400'
                                            : 'text-neutral-300'
                                            }`}
                                        onClick={item.onClick}
                                    />
                                </DockIcon>
                            </DockItem>
                        ))}

                        {/* Separator */}
                        <div className='h-full w-[1px] bg-neutral-700 mx-1' />

                        {/* Logout */}
                        <DockItem className='aspect-square rounded-full bg-neutral-800 border border-white/10'>
                            <DockLabel>Logout</DockLabel>
                            <DockIcon>
                                <LogOut
                                    className='h-full w-full cursor-pointer text-red-400'
                                    onClick={handleLogout}
                                />
                            </DockIcon>
                        </DockItem>
                    </Dock>
                </div>
            </div>
        </div>
    );
}

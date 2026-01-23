import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, LogOut, Users, Briefcase } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { useAuth } from '@/components/AuthProvider';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function AppDock() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut, user } = useAuth();
    const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);

    const handleLogout = async () => {
        try {
            navigate('/');
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Fetch user role
    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) return;

            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                setUserRole(profile?.role || 'member');
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, [user]);

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
    ];

    // Add Admin option if user is admin
    if (userRole === 'admin') {
        navItems.push({
            title: 'Admin',
            icon: Briefcase,
            onClick: () => navigate('/admin'),
            isActive: location.pathname === '/admin',
        });
    }

    navItems.push(
        {
            title: 'Organization',
            icon: Users,
            onClick: () => navigate('/organization'),
            isActive: location.pathname === '/organization',
        }
    );

    return (
        <div className='fixed top-0 left-0 right-0 z-50 border-b bg-background'>
            <div className='relative flex items-center justify-between px-6 h-20'>
                {/* Logo, Text, and Subtitle on Left */}
                {/* Title on Left */}
                <div className="flex items-center gap-4">
                     <span className="text-xl font-bold text-foreground tracking-tight">Structured Interview Kit Generator</span>
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

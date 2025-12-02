import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppDock } from './AppDock';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';

export function AppLayout() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [checkingOrg, setCheckingOrg] = useState(true);

    useEffect(() => {
        const checkOrg = async () => {
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                navigate('/organization-setup');
            }
            setCheckingOrg(false);
        };

        checkOrg();
    }, [user, navigate]);

    if (checkingOrg) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
            <AppDock />
            <main className="flex-1 overflow-auto pt-20">
                <Outlet />
            </main>
        </div>
    );
}

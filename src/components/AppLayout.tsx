import { Outlet } from 'react-router-dom';
import { AppDock } from './AppDock';

export function AppLayout() {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
            <AppDock />
            <main className="flex-1 overflow-auto pt-20">
                <Outlet />
            </main>
        </div>
    );
}

import { Outlet } from 'react-router-dom';
import { AppDock } from './AppDock';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function AppLayout() {
    const [isDockHovered, setIsDockHovered] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background relative">
            <AppDock onHoverChange={setIsDockHovered} />
            <main className={cn(
                "flex-1 overflow-auto pl-24 transition-all duration-300",
                isDockHovered && "blur-sm opacity-50 scale-[0.99]"
            )}>
                <Outlet />
            </main>
        </div>
    );
}

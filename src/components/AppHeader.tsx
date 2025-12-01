import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Link, useLocation } from "react-router-dom";

export function AppHeader() {
    const { user, signOut } = useAuth();
    const location = useLocation();

    return (
        <div className="border-b bg-background">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/generator" className="text-xl font-bold">
                        Interview Kit Generator
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link
                            to="/generator"
                            className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/generator' ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                        >
                            Generator
                        </Link>
                        <Link
                            to="/dashboard"
                            className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.startsWith('/dashboard') ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                        >
                            Dashboard
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">{user?.email}</span>
                    <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
                </div>
            </div>
        </div>
    );
}

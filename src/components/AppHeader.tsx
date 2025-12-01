import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function AppHeader() {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="border-b">
            <div className="flex h-20 items-center px-6 container mx-auto justify-between">
                <div className="flex items-center gap-12">
                    <Link to="/generator" className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text transition-all hover:opacity-80">
                        Interview Kit Generator
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link
                            to="/generator"
                            className={`text-sm font-medium transition-all hover:text-foreground relative pb-1 ${location.pathname === '/generator'
                                ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Generator
                        </Link>
                        <Link
                            to="/dashboard"
                            className={`text-sm font-medium transition-all hover:text-foreground relative pb-1 ${location.pathname.startsWith('/dashboard')
                                ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Dashboard
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">{user?.email}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                            navigate('/');
                            await signOut();
                        }}
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}

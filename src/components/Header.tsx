import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm"
        >
            <div className="flex items-center gap-3">
                <img src="/kadoshAI.png" alt="kadoshAI Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                    Structured Interview Kit Generator
                </span>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
            </Button>
        </motion.header>
    );
}

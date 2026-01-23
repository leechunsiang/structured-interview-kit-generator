import { motion } from "framer-motion";

export function LandingFooter() {
    return (
        <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full py-6 mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm"
        >
            <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Copyright © 2026</span>
                    <img src="/kadoshAI_logo.png" alt="KadoshAI Logo" className="h-5 w-auto opacity-80" />
                    <span>All rights reserved.</span>
                </div>
            </div>
        </motion.footer>
    );
}

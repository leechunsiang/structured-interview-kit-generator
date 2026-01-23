import { motion } from "framer-motion";
import { 
    Brain, 
    FileText, 
    MessageSquare, 
    ShieldCheck, 
    Target, 
    Zap,
    Sparkles,
    Briefcase,
    Users
} from "lucide-react";

const features = [
    { icon: Brain, text: "AI-Powered Analysis" },
    { icon: FileText, text: "Smart Rubric Generation" },
    { icon: MessageSquare, text: "Contextual Questions" },
    { icon: ShieldCheck, text: "Bias-Free Evaluation" },
    { icon: Target, text: "Role-Specific Competencies" },
    { icon: Zap, text: "Instant Interview Kits" },
    { icon: Sparkles, text: "Automated Feedback" },
    { icon: Briefcase, text: "Streamlined Hiring" },
    { icon: Users, text: "Collaborative Tools" },
];

export function FeatureCarousel() {
    return (
        <div className="w-full py-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 z-10 pointer-events-none" />
            
            <div className="flex">
                <motion.div
                    className="flex gap-8 px-4"
                    animate={{
                        x: ["0%", "-50%"],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40,
                            ease: "linear",
                        },
                    }}
                >
                    {[...features, ...features, ...features, ...features].map((feature, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 flex items-center gap-3 px-5 py-2.5 rounded-full bg-background/20 backdrop-blur-md border border-white/10 shadow-sm"
                        >
                            <feature.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground/90 whitespace-nowrap">
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

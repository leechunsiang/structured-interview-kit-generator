import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import GradientText from "@/components/GradientText";
import LiquidEther from "@/components/LiquidEther";
import { FeatureCarousel } from "@/components/FeatureCarousel";
import { useNavigate } from "react-router-dom";

export function Hero() {
    const navigate = useNavigate();


    return (
        <section className="relative overflow-hidden bg-background flex flex-col items-center justify-center min-h-screen pt-20">
            {/* LiquidEther Background */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <LiquidEther
                    colors={['#00FF00', '#B4FFB4', '#00FF00']}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={false}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>

            {/* Hero Content */}
            <div className="container mx-auto px-4 relative z-10 w-full flex flex-col items-center justify-center flex-grow">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center text-center max-w-5xl mx-auto"
                >
                    <div className="mb-6 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-md">
                         <span className="text-sm font-medium text-primary uppercase tracking-wider">
                            Next Gen Hiring Tools
                        </span>
                    </div>

                    <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl mb-6 leading-[1.1] sm:leading-[1.1]">
                        <span className="block mb-2">Streamline Your</span>
                        <GradientText
                            colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
                            animationSpeed={3}
                            className="inline-block"
                        >
                            Hiring Process
                        </GradientText>
                    </h1>

                    <motion.p
                        className="mt-4 text-xl sm:text-2xl text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed font-light"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Generate structured interview kits in seconds. Empower your HR team with AI-driven tools to find the best talent efficiently.
                    </motion.p>

                    <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center w-full">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button 
                                size="lg" 
                                className="h-14 px-8 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)] transition-all duration-300" 
                                onClick={() => navigate('/login')}
                            >
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
            
            <div className="w-full relative z-10 opacity-90 mb-10">
                <FeatureCarousel />
            </div>
        </section>
    );
}

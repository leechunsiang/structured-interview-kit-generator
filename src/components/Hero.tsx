import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import GradientText from "@/components/GradientText";
import LiquidEther from "@/components/LiquidEther";
import { useNavigate } from "react-router-dom";

export function Hero() {
    const navigate = useNavigate();
    const supportingText = "Generate structured interview kits in seconds. Empower your HR team with AI-driven tools to find the best talent efficiently.";

    return (
        <section className="relative overflow-hidden bg-background flex items-center" style={{ minHeight: '100vh' }}>
            {/* Liquid Ether Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
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
            <div className="container mx-auto px-4 relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col justify-center text-center max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl pb-4 mb-2 leading-tight">
                        <GradientText
                            colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
                            animationSpeed={3}
                            className="inline-block overflow-visible leading-normal"
                        >
                            Streamline Your Hiring Process
                        </GradientText>
                    </h1>
                    <motion.p
                        className="mt-6 text-lg text-muted-foreground mx-auto max-w-2xl bg-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{
                                duration: 2,
                                delay: 0.5,
                                ease: "easeInOut"
                            }}
                            style={{
                                display: "inline-block",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                verticalAlign: "bottom",
                                backgroundColor: "transparent"
                            }}
                        >
                            {supportingText}
                        </motion.span>
                    </motion.p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <motion.div
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 10px 30px rgba(64, 255, 170, 0.3)"
                            }}
                            whileTap={{
                                scale: 0.95,
                                boxShadow: "0 5px 15px rgba(64, 255, 170, 0.2)"
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.7,
                                type: "spring",
                                stiffness: 260,
                                damping: 20
                            }}
                        >
                            <Button size="lg" className="w-full sm:w-auto gap-2" onClick={() => navigate('/login')}>
                                Get Started <ArrowRight className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>AI-Powered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>Structured Kits</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>Bias Reduction</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

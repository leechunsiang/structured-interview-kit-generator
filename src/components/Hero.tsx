import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background pt-16 md:pt-20 lg:pt-24">
            <div className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col justify-center text-center lg:text-left"
                    >
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                            Streamline Your <span className="text-primary">Hiring Process</span>
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground sm:mx-auto sm:max-w-xl lg:mx-0">
                            Generate structured interview kits in seconds. Empower your HR team with AI-driven tools to find the best talent efficiently.
                        </p>
                        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                            <Button size="lg" className="w-full sm:w-auto gap-2">
                                Get Started <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Learn More
                            </Button>
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start text-sm text-muted-foreground">
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

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-8 shadow-2xl ring-1 ring-gray-900/10 dark:ring-gray-100/10">
                            {/* Abstract visual representation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-4 opacity-80">
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                        className="h-32 w-32 rounded-2xl bg-primary/40 backdrop-blur-sm"
                                    />
                                    <motion.div
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                        className="h-32 w-32 rounded-2xl bg-secondary/60 backdrop-blur-sm mt-12"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
                                        className="h-32 w-32 rounded-2xl bg-accent/60 backdrop-blur-sm"
                                    />
                                    <motion.div
                                        animate={{ y: [0, 15, 0] }}
                                        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.5 }}
                                        className="h-32 w-32 rounded-2xl bg-primary/20 backdrop-blur-sm mt-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

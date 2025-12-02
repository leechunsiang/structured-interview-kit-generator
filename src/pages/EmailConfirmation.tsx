import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

export function EmailConfirmation() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background py-8">
            <Card className="w-full max-w-md animate-scale-in">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-6 relative">
                        {/* Email icon with animated glow effect */}
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full animate-pulse-glow"></div>
                            <div className="relative bg-gradient-to-br from-accent to-primary p-6 rounded-full shadow-neon-strong">
                                <Mail className="h-16 w-16 text-white" />
                            </div>
                        </div>
                        {/* Check mark badge */}
                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg border-4 border-background">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-black">Check Your Email</CardTitle>
                    <CardDescription className="text-base mt-2">
                        We've sent you a confirmation link
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <div className="space-y-3">
                        <p className="text-muted-foreground">
                            We've sent a confirmation email to your inbox. Please click the link in the email to verify your account and complete the signup process.
                        </p>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
                            <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                What's next?
                            </p>
                            <ol className="text-sm text-muted-foreground space-y-2 text-left list-decimal list-inside">
                                <li>Open your email inbox</li>
                                <li>Find the confirmation email from KadoshAI</li>
                                <li>Click the verification link</li>
                                <li>Return here to log in</li>
                            </ol>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button asChild className="w-full" variant="default">
                            <Link to="/login">
                                Continue to Login
                            </Link>
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                            <Link to="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            Didn't receive the email? Check your spam folder or contact support.
                        </p>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <img src="/kadoshAI.png" alt="kadoshAI" className="h-6 opacity-90 hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X } from 'lucide-react';

const signUpSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    acceptPrivacyPolicy: z.boolean().refine((val) => val === true, {
        message: 'You must accept the privacy policy to create an account',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    bgColor: string;
}

function calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;

    if (!password) return { score: 0, label: '', color: '', bgColor: '' };

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Contains lowercase
    if (/[a-z]/.test(password)) score++;

    // Contains uppercase
    if (/[A-Z]/.test(password)) score++;

    // Contains number
    if (/[0-9]/.test(password)) score++;

    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Determine strength
    if (score <= 2) {
        return { score: 1, label: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
    } else if (score <= 4) {
        return { score: 2, label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    } else if (score <= 5) {
        return { score: 3, label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-500' };
    } else {
        return { score: 4, label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' };
    }
}

export function SignUp() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, watch } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        mode: 'onChange', // This enables real-time validation and watch updates
    });

    const password = watch('password') || '';
    const passwordStrength = calculatePasswordStrength(password);

    const onSubmit = async (data: SignUpFormValues) => {
        setLoading(true);
        setError(null);

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                    },
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No user returned after signup');

            // If session is established immediately:
            if (authData.session) {
                navigate('/organization-setup');
            } else {
                // Email confirmation required - navigate to confirmation page
                navigate('/email-confirmation');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Create an account to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant={error.includes('check your email') ? 'default' : 'destructive'}>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" {...register('fullName')} />
                            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

                            {/* Password Strength Meter */}
                            {password.length > 0 && (
                                <div className="space-y-2 mt-3">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-2 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.score
                                                    ? passwordStrength.bgColor
                                                    : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-semibold ${passwordStrength.color}`}>
                                        Password strength: {passwordStrength.label}
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-1.5 mt-2 pt-2 border-t">
                                        <div className="flex items-center gap-1.5">
                                            {password.length >= 8 ? (
                                                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            )}
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {/[A-Z]/.test(password) ? (
                                                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            )}
                                            <span>Contains uppercase letter</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {/[a-z]/.test(password) ? (
                                                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            )}
                                            <span>Contains lowercase letter</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {/[0-9]/.test(password) ? (
                                                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            )}
                                            <span>Contains number</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {/[^A-Za-z0-9]/.test(password) ? (
                                                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            )}
                                            <span>Contains special character</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword')}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <div className="flex items-start space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="acceptPrivacyPolicy"
                                {...register('acceptPrivacyPolicy')}
                                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                            />
                            <div className="flex-1">
                                <Label htmlFor="acceptPrivacyPolicy" className="text-sm font-normal cursor-pointer">
                                    I agree to the{' '}
                                    <Link
                                        to="/privacy-policy"
                                        className="text-primary hover:underline font-medium"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Privacy Policy
                                    </Link>
                                </Label>
                                {errors.acceptPrivacyPolicy && (
                                    <p className="text-sm text-red-500 mt-1">{errors.acceptPrivacyPolicy.message}</p>
                                )}
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
                    </p>
                </CardFooter>
            </Card>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <img src="/kadoshAI.png" alt="kadoshAI" className="h-6 opacity-90 hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}

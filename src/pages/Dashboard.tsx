import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { AppHeader } from '../components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface Job {
    id: string;
    title: string;
    description: string;
    created_at: string;
}

export function Dashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;

            try {
                // Get Org ID
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (profile?.organization_id) {
                    const { data: jobsData, error } = await supabase
                        .from('jobs')
                        .select('*')
                        .eq('org_id', profile.organization_id)
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    setJobs(jobsData || []);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [user]);

    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <main className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <Button asChild>
                        <Link to="/generator">Create New Kit</Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-card">
                        <h3 className="text-lg font-semibold mb-2">No Interview Kits Found</h3>
                        <p className="text-muted-foreground mb-6">Get started by generating your first interview kit.</p>
                        <Button asChild>
                            <Link to="/generator">Generate Kit</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <Card key={job.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="line-clamp-1" title={job.title}>{job.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(job.created_at), 'MMM d, yyyy')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {job.description}
                                    </p>
                                    <Button asChild variant="outline" className="w-full mt-auto group">
                                        <Link to={`/dashboard/${job.id}`}>
                                            View Kit
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

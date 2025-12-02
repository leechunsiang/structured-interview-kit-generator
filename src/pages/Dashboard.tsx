import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, ArrowRight, FolderOpen, Trash2, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Job {
    id: string;
    title: string;
    description: string;
    created_at: string;
    kit_score?: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    submitted_at?: string;
    reviewed_at?: string;
    reviewed_by?: string;
    rejection_reason?: string;
}

export function Dashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [submittingJobId, setSubmittingJobId] = useState<string | null>(null);
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
                        .eq('profile_id', user.id)
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

    const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Prevent card click

        if (!window.confirm('Are you sure you want to delete this interview kit? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', jobId);

            if (error) throw error;

            setJobs(jobs.filter(job => job.id !== jobId));
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete the interview kit. Please try again.');
        }
    };

    const handleSubmitJob = async (e: React.MouseEvent, jobId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Submit this job for admin approval? You will not be able to view the kit until it is approved.')) {
            return;
        }

        setSubmittingJobId(jobId);
        try {
            const { error } = await supabase
                .from('jobs')
                .update({
                    status: 'pending',
                    submitted_at: new Date().toISOString()
                })
                .eq('id', jobId);

            if (error) throw error;

            // Update local state
            setJobs(jobs.map(job =>
                job.id === jobId
                    ? { ...job, status: 'pending', submitted_at: new Date().toISOString() }
                    : job
            ));
        } catch (error) {
            console.error('Error submitting job:', error);
            alert('Failed to submit the job. Please try again.');
        } finally {
            setSubmittingJobId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200'
        };

        const icons = {
            draft: Clock,
            pending: Clock,
            approved: CheckCircle,
            rejected: XCircle
        };

        const Icon = icons[status as keyof typeof icons];

        return (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border-2 ${styles[status as keyof typeof styles]}`}>
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    };

    const renderActionButton = (job: Job) => {
        const isSubmitting = submittingJobId === job.id;

        switch (job.status) {
            case 'draft':
                return (
                    <Button
                        onClick={(e) => handleSubmitJob(e, job.id)}
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit for Approval
                            </>
                        )}
                    </Button>
                );
            case 'pending':
                return (
                    <Button disabled className="w-full" variant="outline">
                        <Clock className="mr-2 h-4 w-4" />
                        Pending Approval
                    </Button>
                );
            case 'approved':
                return (
                    <Button asChild variant="outline" className="w-full group-hover:border-blue-600 group-hover:text-blue-600 transition-all">
                        <Link to={`/dashboard/${job.id}`}>
                            View Kit
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </Button>
                );
            case 'rejected':
                return (
                    <Button disabled className="w-full" variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejected
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">

            <main className="container mx-auto py-12 px-6">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold">My Dashboard</h1>
                    <div className="flex gap-4">
                        <Button asChild variant="outline" size="lg">
                            <Link to="/all-jobs">View All Jobs</Link>
                        </Button>
                        <Button asChild variant="accent" size="lg">
                            <Link to="/generator">Create New Kit</Link>
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/20 hover:bg-muted/30 transition-smooth">
                        <FolderOpen className="h-20 w-20 mx-auto mb-6 text-muted-foreground/50" />
                        <h3 className="text-2xl font-semibold mb-3">No Interview Kits Found</h3>
                        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">Get started by generating your first interview kit. It only takes a few minutes!</p>
                        <Button asChild variant="accent" size="lg">
                            <Link to="/generator">Generate Kit</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map((job) => (
                            <Card key={job.id} className="flex flex-col hover:shadow-elevated-lg hover:scale-[1.02] cursor-pointer group">
                                <CardHeader className="relative pr-12">
                                    <CardTitle className="line-clamp-1 text-xl" title={job.title}>{job.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(job.created_at), 'MMM d, yyyy')}
                                    </CardDescription>
                                    <div className="absolute top-4 right-14">
                                        {getStatusBadge(job.status)}
                                    </div>
                                    {job.kit_score !== undefined && job.kit_score > 0 && job.status === 'approved' && (
                                        <div className="absolute top-4 right-28">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border-2 ${job.kit_score >= 80 ? 'bg-green-100 text-green-700 border-green-200' :
                                                job.kit_score >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                {job.kit_score}
                                            </div>
                                        </div>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        onClick={(e) => handleDeleteJob(e, job.id)}
                                        title="Delete Kit"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {job.description}
                                    </p>
                                    {job.status === 'rejected' && job.rejection_reason && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                                            <p className="text-xs font-semibold text-red-900 mb-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Rejection Reason:
                                            </p>
                                            <p className="text-xs text-red-700">{job.rejection_reason}</p>
                                        </div>
                                    )}
                                    <div className="mt-auto">
                                        {renderActionButton(job)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}


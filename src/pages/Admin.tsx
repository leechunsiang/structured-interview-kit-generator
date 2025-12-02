import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, CheckCircle, XCircle, Clock, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

interface Job {
    id: string;
    title: string;
    description: string;
    created_at: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    submitted_at?: string;
    reviewed_at?: string;
    reviewed_by?: string;
    rejection_reason?: string;
    profile_id: string;
    profiles?: {
        email: string;
    };
}

export function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedTab, setSelectedTab] = useState('pending');
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingJobId, setProcessingJobId] = useState<string | null>(null);

    useEffect(() => {
        const checkAdminAndFetchJobs = async () => {
            if (!user) return;

            try {
                // Check if user is admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, organization_id')
                    .eq('id', user.id)
                    .single();

                if (profile?.role !== 'admin') {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                setIsAdmin(true);

                // Fetch all jobs in organization with creator info
                if (profile?.organization_id) {
                    const { data: jobsData, error } = await supabase
                        .from('jobs')
                        .select(`
                            *,
                            profiles!jobs_profile_id_fkey(email)
                        `)
                        .eq('org_id', profile.organization_id)
                        .order('submitted_at', { ascending: false, nullsFirst: false })
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    setJobs(jobsData || []);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAdminAndFetchJobs();

        // Set up real-time subscription
        const channel = supabase
            .channel('admin-jobs-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'jobs'
                },
                () => {
                    checkAdminAndFetchJobs();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleApprove = async (jobId: string) => {
        setProcessingJobId(jobId);
        try {
            const { error } = await supabase
                .from('jobs')
                .update({
                    status: 'approved',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id
                })
                .eq('id', jobId);

            if (error) throw error;
        } catch (error) {
            console.error('Error approving job:', error);
            alert('Failed to approve job. Please try again.');
        } finally {
            setProcessingJobId(null);
        }
    };

    const handleRejectClick = (job: Job) => {
        setSelectedJob(job);
        setRejectionReason('');
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedJob || !rejectionReason.trim()) {
            alert('Please provide a rejection reason.');
            return;
        }

        setProcessingJobId(selectedJob.id);
        try {
            const { error } = await supabase
                .from('jobs')
                .update({
                    status: 'rejected',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id,
                    rejection_reason: rejectionReason
                })
                .eq('id', selectedJob.id);

            if (error) throw error;
            setRejectDialogOpen(false);
        } catch (error) {
            console.error('Error rejecting job:', error);
            alert('Failed to reject job. Please try again.');
        } finally {
            setProcessingJobId(null);
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
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${styles[status as keyof typeof styles]}`}>
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    };

    const filteredJobs = jobs.filter(job => {
        if (selectedTab === 'all') return true;
        return job.status === selectedTab;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>You need admin privileges to access this page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto py-12 px-6">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground text-lg">Review and manage job submissions</p>
                </div>

                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                        <TabsTrigger value="pending">
                            Pending ({jobs.filter(j => j.status === 'pending').length})
                        </TabsTrigger>
                        <TabsTrigger value="approved">
                            Approved ({jobs.filter(j => j.status === 'approved').length})
                        </TabsTrigger>
                        <TabsTrigger value="rejected">
                            Rejected ({jobs.filter(j => j.status === 'rejected').length})
                        </TabsTrigger>
                        <TabsTrigger value="all">
                            All ({jobs.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedTab} className="space-y-4">
                        {filteredJobs.length === 0 ? (
                            <Card className="text-center py-12">
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground text-lg">No jobs found in this category.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredJobs.map((job) => (
                                    <Card key={job.id} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <CardTitle className="line-clamp-1 text-xl" title={job.title}>
                                                    {job.title}
                                                </CardTitle>
                                                {getStatusBadge(job.status)}
                                            </div>
                                            <CardDescription className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <UserIcon className="h-3 w-3" />
                                                    <span className="truncate">{job.profiles?.email || 'Unknown'}</span>
                                                </div>
                                                {job.submitted_at && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        Submitted {format(new Date(job.submitted_at), 'MMM d, yyyy')}
                                                    </div>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col gap-4">
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {job.description}
                                            </p>

                                            {job.status === 'rejected' && job.rejection_reason && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <p className="text-xs font-semibold text-red-900 mb-1">Rejection Reason:</p>
                                                    <p className="text-xs text-red-700">{job.rejection_reason}</p>
                                                </div>
                                            )}

                                            {job.status === 'pending' && (
                                                <div className="flex gap-2 mt-auto">
                                                    <Button
                                                        onClick={() => handleApprove(job.id)}
                                                        disabled={processingJobId === job.id}
                                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                                    >
                                                        {processingJobId === job.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleRejectClick(job)}
                                                        disabled={processingJobId === job.id}
                                                        variant="destructive"
                                                        className="flex-1"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Job Submission</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting "{selectedJob?.title}". This will be visible to the submitter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain why this job is being rejected..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectConfirm}
                            disabled={!rejectionReason.trim() || processingJobId !== null}
                        >
                            {processingJobId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import { KitPreview } from '@/components/generator/KitPreview';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { type Question } from '@/components/generator/QuestionReview';

export function JobDetails() {
    const { jobId } = useParams<{ jobId: string }>();
    const [job, setJob] = useState<{ title: string; description: string; kit_score?: number; kit_score_explanation?: string } | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!jobId) return;

            try {
                // 1. Fetch Job
                const { data: jobData, error: jobError } = await supabase
                    .from('jobs')
                    .select('title, description, kit_score, kit_score_explanation')
                    .eq('id', jobId)
                    .single();

                if (jobError) throw jobError;
                setJob(jobData);

                // 2. Fetch Competencies and Questions
                // We need to join competencies and questions.
                // Since Supabase join syntax can be complex for nested arrays, let's do it in two steps or use a deep select.
                // Let's try a deep select first.

                const { data: competenciesData, error: compError } = await supabase
                    .from('competencies')
                    .select(`
                        id,
                        name,
                        questions (
                            id,
                            text,
                            category,
                            explanation,
                            rubric_good,
                            rubric_bad
                        )
                    `)
                    .eq('job_id', jobId);

                if (compError) throw compError;

                // Flatten to Question[] format expected by KitPreview
                const flatQuestions: Question[] = [];
                competenciesData?.forEach((comp: any) => {
                    comp.questions?.forEach((q: any) => {
                        flatQuestions.push({
                            id: q.id,
                            competencyName: comp.name,
                            text: q.text,
                            category: q.category,
                            explanation: q.explanation,
                            rubric_good: q.rubric_good,
                            rubric_bad: q.rubric_bad
                        });
                    });
                });

                setQuestions(flatQuestions);

            } catch (error) {
                console.error('Error fetching job details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">

                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-background">

                <div className="container mx-auto py-8 px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
                    <Button asChild>
                        <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">

            <main className="container mx-auto py-8 px-4">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <KitPreview
                    jobTitle={job.title}
                    questions={questions}
                    onReset={() => { }} // No-op for view only
                    viewOnly={true}
                    kitScore={job.kit_score}
                    kitScoreExplanation={job.kit_score_explanation}
                />
            </main>
        </div>
    );
}

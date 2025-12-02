import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import { KitPreview } from '@/components/generator/KitPreview';
import { QuestionReview, type Question } from '@/components/generator/QuestionReview';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Pencil } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export function JobDetails() {
    const { user } = useAuth();
    const { jobId } = useParams<{ jobId: string }>();
    const [job, setJob] = useState<{ title: string; description: string; kit_score?: number; kit_score_explanation?: string; profile_id?: string } | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [originalQuestionIds, setOriginalQuestionIds] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!jobId) return;

            try {
                // 1. Fetch Job
                const { data: jobData, error: jobError } = await supabase
                    .from('jobs')
                    .select('title, description, kit_score, kit_score_explanation, profile_id')
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
                            competency_id: comp.id, // Store competency_id for updates
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
                setOriginalQuestionIds(new Set(flatQuestions.map(q => q.id!).filter(Boolean)));

            } catch (error) {
                console.error('Error fetching job details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    const handleSaveQuestions = async () => {
        if (!jobId) return;
        setIsSaving(true);

        try {
            // 1. Identify questions to delete
            const currentIds = new Set(questions.map(q => q.id).filter(Boolean) as string[]);
            const idsToDelete = [...originalQuestionIds].filter(id => !currentIds.has(id));

            if (idsToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('questions')
                    .delete()
                    .in('id', idsToDelete);

                if (deleteError) throw deleteError;
            }

            // 2. Upsert questions (update existing or insert new)
            // We need to map Question objects to DB format
            // Note: New questions might not have competency_id if they were added in UI without context,
            // but QuestionReview groups by competencyName. We should try to find competency_id by name.

            // First, get all competencies for this job to map names to IDs
            const { data: competencies } = await supabase
                .from('competencies')
                .select('id, name')
                .eq('job_id', jobId);

            const competencyMap = new Map(competencies?.map(c => [c.name, c.id]));

            const questionsToUpsert = questions.map(q => {
                let compId = q.competency_id;

                // If no ID but we have a name, try to find the ID
                if (!compId && q.competencyName) {
                    compId = competencyMap.get(q.competencyName);
                }

                // If still no ID (new competency?), we might need to handle that, 
                // but for now let's assume questions belong to existing competencies or skip.
                // In this simplified edit flow, we probably won't be creating new competencies, just questions within them.
                if (!compId) {
                    console.warn(`Skipping question without competency ID: ${q.text.substring(0, 20)}...`);
                    return null;
                }

                return {
                    id: q.id, // If undefined, Supabase will generate new ID
                    competency_id: compId,
                    text: q.text,
                    category: q.category,
                    explanation: q.explanation,
                    rubric_good: q.rubric_good,
                    rubric_bad: q.rubric_bad,
                    created_at: new Date().toISOString() // Will be ignored on update if not in column list or handled by DB default
                };
            }).filter(Boolean);

            if (questionsToUpsert.length > 0) {
                const { error: upsertError } = await supabase
                    .from('questions')
                    .upsert(questionsToUpsert, { onConflict: 'id' });

                if (upsertError) throw upsertError;
            }

            // 3. Refresh data
            // Re-fetch to get new IDs and ensure sync
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

            const flatQuestions: Question[] = [];
            competenciesData?.forEach((comp: any) => {
                comp.questions?.forEach((q: any) => {
                    flatQuestions.push({
                        id: q.id,
                        competency_id: comp.id,
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
            setOriginalQuestionIds(new Set(flatQuestions.map(q => q.id!).filter(Boolean)));
            setIsEditing(false);

        } catch (error) {
            console.error('Error saving questions:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

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
                <div className="mb-6 flex justify-between items-center">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    {/* Show Edit button if user is owner and not currently editing */}
                    {!isEditing && user && job.profile_id === user.id && (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Kit
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    <QuestionReview
                        questions={questions}
                        setQuestions={setQuestions}
                        onNext={handleSaveQuestions}
                        onBack={() => {
                            // Revert changes by re-fetching or just toggling off (if we want to discard local changes)
                            // For simplicity, let's just toggle off, but ideally we should confirm discard
                            if (window.confirm('Discard unsaved changes?')) {
                                setIsEditing(false);
                                // Trigger re-fetch to reset state
                                window.location.reload();
                            }
                        }}
                        onGenerateMore={() => { }} // Not implemented for edit mode yet
                        loading={isSaving}
                        isEditingExisting={true}
                    />
                ) : (
                    <KitPreview
                        jobTitle={job.title}
                        questions={questions}
                        onReset={() => { }} // No-op for view only
                        viewOnly={true}
                        kitScore={job.kit_score}
                        kitScoreExplanation={job.kit_score_explanation}
                    />
                )}
            </main>
        </div>
    );
}

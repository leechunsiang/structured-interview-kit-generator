import { useState } from 'react';
import { generateCompetencies, generateQuestions } from '../lib/openai';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { JobInputForm } from '@/components/generator/JobInputForm';
import { CompetencyList, type Competency } from '@/components/generator/CompetencyList';
import { QuestionReview, type Question } from '@/components/generator/QuestionReview';
import { KitPreview } from '@/components/generator/KitPreview';

type Step = 'job-input' | 'competency-review' | 'question-review' | 'kit-preview';

export function Generator() {
    const { user, signOut } = useAuth();
    const [step, setStep] = useState<Step>('job-input');
    const [loading, setLoading] = useState(false);
    // State for data
    const [jobData, setJobData] = useState<{ title: string; description: string } | null>(null);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);

    // Step 1 -> 2: Extract Competencies
    const handleJobSubmit = async (data: { title: string; description: string }) => {
        setJobData(data);
        setLoading(true);

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey) throw new Error('Missing OpenAI API Key. Please set VITE_OPENAI_API_KEY in your .env file.');

            const result = await generateCompetencies(data.title, data.description, apiKey);
            setCompetencies(result);
            setStep('competency-review');
        } catch (error: any) {
            console.error('Error extracting competencies:', error);
            alert(error.message || 'Failed to extract competencies.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 -> 3: Generate Questions
    const handleCompetenciesConfirm = async () => {
        setLoading(true);
        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey) throw new Error('Missing OpenAI API Key. Please set VITE_OPENAI_API_KEY in your .env file.');

            const result = await generateQuestions(jobData?.title || '', competencies, apiKey);
            setQuestions(result);
            setStep('question-review');
        } catch (error: any) {
            console.error('Error generating questions:', error);
            alert(error.message || 'Failed to generate questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionsConfirm = async () => {
        if (!user || !jobData) return;
        setLoading(true);

        try {
            // 1. Get Org ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) throw new Error('No organization found');

            // 2. Create Job
            const { data: job, error: jobError } = await supabase
                .from('jobs')
                .insert({
                    org_id: profile.organization_id,
                    title: jobData.title,
                    description: jobData.description
                })
                .select()
                .single();

            if (jobError) throw jobError;

            // 3. Create Competencies & Questions
            // Group questions by competency name to map them back
            const questionsByComp = questions.reduce((acc, q) => {
                const key = q.competencyName || 'General';
                if (!acc[key]) acc[key] = [];
                acc[key].push(q);
                return acc;
            }, {} as Record<string, Question[]>);

            for (const comp of competencies) {
                const { data: compData, error: compError } = await supabase
                    .from('competencies')
                    .insert({
                        job_id: job.id,
                        name: comp.name,
                        description: comp.description
                    })
                    .select()
                    .single();

                if (compError) throw compError;

                const compQuestions = questionsByComp[comp.name] || [];
                if (compQuestions.length > 0) {
                    const questionsToInsert = compQuestions.map(q => ({
                        competency_id: compData.id,
                        text: q.text,
                        category: q.category,
                        explanation: q.explanation,
                        rubric_good: q.rubric_good,
                        rubric_bad: q.rubric_bad
                    }));

                    const { error: qError } = await supabase
                        .from('questions')
                        .insert(questionsToInsert);

                    if (qError) throw qError;
                }
            }

            setStep('kit-preview');
        } catch (error) {
            console.error('Error saving kit:', error);
            alert('Failed to save interview kit.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setJobData(null);
        setCompetencies([]);
        setQuestions([]);
        setStep('job-input');
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b">
                <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                    <h1 className="text-xl font-bold">Interview Kit Generator</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user?.email}</span>
                        <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto py-8 px-4">
                {step === 'job-input' && (
                    <JobInputForm onNext={handleJobSubmit} loading={loading} />
                )}

                {step === 'competency-review' && (
                    <CompetencyList
                        competencies={competencies}
                        setCompetencies={setCompetencies}
                        onNext={handleCompetenciesConfirm}
                        onBack={() => setStep('job-input')}
                        loading={loading}
                    />
                )}

                {step === 'question-review' && (
                    <QuestionReview
                        questions={questions}
                        setQuestions={setQuestions}
                        onNext={handleQuestionsConfirm}
                        onBack={() => setStep('competency-review')}
                        loading={loading}
                    />
                )}

                {step === 'kit-preview' && jobData && (
                    <KitPreview
                        jobTitle={jobData.title}
                        questions={questions}
                        onReset={handleReset}
                    />
                )}
            </main>
        </div>
    );
}


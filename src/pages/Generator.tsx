import { useState } from 'react';
import { generateCompetencies, generateQuestions, generateKitScore } from '../lib/openai';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { JobInputForm } from '@/components/generator/JobInputForm';
import { CompetencyList, type Competency } from '@/components/generator/CompetencyList';
import { QuestionReview, type Question } from '@/components/generator/QuestionReview';
import { KitPreview } from '@/components/generator/KitPreview';

import { toast } from 'sonner';

type Step = 'job-input' | 'competency-review' | 'question-review' | 'kit-preview';

export function Generator() {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('job-input');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingStatus, setLoadingStatus] = useState('');
    // State for data
    const [jobData, setJobData] = useState<{ title: string; description: string } | null>(null);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [kitScore, setKitScore] = useState<{ score: number; explanation: string } | null>(null);

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
            toast.error(error.message || 'Failed to extract competencies.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 -> 3: Generate Questions
    const handleCompetenciesConfirm = async () => {
        setLoading(true);
        setProgress(10);
        setLoadingStatus('Initializing AI...');

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey) throw new Error('Missing OpenAI API Key. Please set VITE_OPENAI_API_KEY in your .env file.');

            // Simulate progress for better UX since API call is single await
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 5;
                });
            }, 800);

            setLoadingStatus('Generating interview questions...');
            const result = await generateQuestions(jobData?.title || '', competencies, apiKey);

            clearInterval(progressInterval);
            setProgress(100);
            setLoadingStatus('Questions generated!');

            // Small delay to show 100%
            setTimeout(() => {
                setQuestions(result);
                setStep('question-review');
                setLoading(false);
                setProgress(0);
                setLoadingStatus('');
            }, 500);

        } catch (error: any) {
            console.error('Error generating questions:', error);
            toast.error(error.message || 'Failed to generate questions.');
            setLoading(false);
            setProgress(0);
            setLoadingStatus('');
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

            // 2. Generate Kit Score
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            let generatedKitScore = { score: 0, explanation: '' };
            try {
                if (apiKey) {
                    generatedKitScore = await generateKitScore(jobData.title, jobData.description, questions, apiKey);
                    setKitScore(generatedKitScore);
                }
            } catch (e) {
                console.error('Failed to generate kit score:', e);
            }

            // 3. Create Job
            const { data: job, error: jobError } = await supabase
                .from('jobs')
                .insert({
                    org_id: profile.organization_id,
                    title: jobData.title,
                    description: jobData.description,
                    kit_score: generatedKitScore.score,
                    kit_score_explanation: generatedKitScore.explanation
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

            toast.success('Interview kit saved successfully!');
            setStep('kit-preview');
        } catch (error) {
            console.error('Error saving kit:', error);
            toast.error('Failed to save interview kit.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setJobData(null);
        setCompetencies([]);
        setQuestions([]);
        setKitScore(null);
        setStep('job-input');
    };

    const handleGenerateMore = async () => {
        setLoading(true);
        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey) throw new Error('Missing OpenAI API Key');

            // Generate 1 more question per competency
            const newQuestions = await generateQuestions(jobData?.title || '', competencies, apiKey, 1);
            setQuestions([...questions, ...newQuestions]);
            toast.success(`Generated ${newQuestions.length} more questions!`);
        } catch (error: any) {
            console.error('Error generating more questions:', error);
            toast.error(error.message || 'Failed to generate more questions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">


            <main className="container mx-auto py-12 px-6 max-w-5xl">
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
                        progress={progress}
                        loadingStatus={loadingStatus}
                    />
                )}

                {step === 'question-review' && (
                    <QuestionReview
                        questions={questions}
                        setQuestions={setQuestions}
                        onNext={handleQuestionsConfirm}
                        onBack={() => setStep('competency-review')}
                        onGenerateMore={handleGenerateMore}
                        loading={loading}
                    />
                )}

                {step === 'kit-preview' && jobData && (
                    <KitPreview
                        jobTitle={jobData.title}
                        questions={questions}
                        onReset={handleReset}
                        kitScore={kitScore?.score}
                        kitScoreExplanation={kitScore?.explanation}
                    />
                )}
            </main>
        </div>
    );
}


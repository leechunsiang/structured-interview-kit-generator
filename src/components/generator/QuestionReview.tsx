import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

export interface Question {
    id?: string;
    competency_id?: string; // Optional for UI state before saving
    competencyName?: string; // Helper for UI grouping
    text: string;
    category: 'Competency' | 'Behavioral' | 'Situational' | 'Deceiving';
    explanation: string;
    rubric_good: string;
    rubric_bad: string;
}

interface QuestionReviewProps {
    questions: Question[];
    setQuestions: (questions: Question[]) => void;
    onNext: () => void;
    onBack: () => void;
    onGenerateMore: () => void;
    loading: boolean;
}

export function QuestionReview({ questions, setQuestions, onNext, onBack, onGenerateMore, loading }: QuestionReviewProps) {

    const handleDelete = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleUpdate = (index: number, field: keyof Question, value: string) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    // Group questions by competency
    const groupedQuestions = Array.isArray(questions) ? questions.reduce((acc, q) => {
        const key = q.competencyName || 'General';
        if (!acc[key]) acc[key] = [];
        acc[key].push(q);
        return acc;
    }, {} as Record<string, Question[]>) : {};

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Review Interview Questions</h2>
                    <p className="text-lg text-muted-foreground mt-2">Review and refine the generated questions.</p>
                </div>
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onGenerateMore} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate More'}
                    </Button>
                    <Button variant="outline" onClick={onBack} size="lg">Back</Button>
                    <Button onClick={onNext} disabled={loading || questions.length === 0} size="lg">
                        {loading ? 'Saving...' : 'Finalize Kit'}
                    </Button>
                </div>
            </div>

            {Object.entries(groupedQuestions).map(([competency, groupQuestions]) => (
                <Card key={competency} className="border-l-4 border-l-primary shadow-md">
                    <CardHeader className="bg-muted/20 pb-6 pt-6">
                        <CardTitle className="text-2xl font-bold text-primary">{competency}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        {groupQuestions.map((q, groupIndex) => {
                            const realIndex = questions.indexOf(q);
                            const questionNumber = realIndex + 1;
                            return (
                                <div key={realIndex} className="group relative">
                                    {/* Separator line between questions (except first) */}
                                    {groupIndex > 0 && (
                                        <div className="absolute -top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                                    )}

                                    <div className="rounded-xl border-2 bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                                        {/* Header Section with Question Number */}
                                        <div className="flex items-start justify-between p-6 pb-4 border-b bg-muted/10">
                                            <div className="flex items-start gap-4">
                                                {/* Question Number Circle */}
                                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
                                                    {questionNumber}
                                                </div>
                                                <div className="space-y-2 pt-1">
                                                    <Badge
                                                        variant={
                                                            q.category === 'Behavioral' ? 'default' :
                                                                q.category === 'Deceiving' ? 'destructive' :
                                                                    'secondary'
                                                        }
                                                        className="text-sm px-3 py-1 font-semibold"
                                                    >
                                                        {q.category}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                                        Question {questionNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(realIndex)}
                                                className="text-muted-foreground hover:text-destructive -mr-2 -mt-2"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        {/* Question Input */}
                                        <div className="px-8 pt-6 pb-6">
                                            <label className="block text-sm font-bold text-foreground/80 mb-3 uppercase tracking-wide">
                                                Interview Question
                                            </label>
                                            <Textarea
                                                value={q.text}
                                                onChange={(e) => handleUpdate(realIndex, 'text', e.target.value)}
                                                className="min-h-[140px] text-2xl font-semibold resize-none border-2 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 p-6 rounded-lg question-text"
                                                placeholder="Enter interview question..."
                                            />
                                        </div>

                                        {/* AI Insight */}
                                        <div className="px-8 pb-6">
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 p-6 rounded-lg border-2 border-blue-200/50 dark:border-blue-900/50">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                                        💡 Why this question?
                                                    </p>
                                                </div>
                                                <p className="text-base text-blue-900/90 dark:text-blue-100 leading-relaxed font-readable">
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rubrics Grid */}
                                        <div className="grid md:grid-cols-2 border-t-2 divide-y md:divide-y-0 md:divide-x-2">
                                            {/* Good Indicators */}
                                            <div className="p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
                                                <label className="flex items-center gap-3 text-base font-bold text-green-800 dark:text-green-400 mb-4">
                                                    <span className="h-4 w-4 rounded-full bg-green-600 shadow-sm" />
                                                    ✅ Positive Indicators
                                                </label>
                                                <Textarea
                                                    value={q.rubric_good}
                                                    onChange={(e) => handleUpdate(realIndex, 'rubric_good', e.target.value)}
                                                    className="min-h-[160px] text-base border-2 border-green-200/50 dark:border-green-900/50 focus-visible:ring-green-500/20 bg-white dark:bg-transparent leading-relaxed font-readable"
                                                    placeholder="What to look for in a strong answer..."
                                                />
                                            </div>

                                            {/* Red Flags */}
                                            <div className="p-6 bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-950/20 dark:to-rose-950/10">
                                                <label className="flex items-center gap-3 text-base font-bold text-red-800 dark:text-red-400 mb-4">
                                                    <span className="h-4 w-4 rounded-full bg-red-600 shadow-sm" />
                                                    🚩 Red Flags
                                                </label>
                                                <Textarea
                                                    value={q.rubric_bad}
                                                    onChange={(e) => handleUpdate(realIndex, 'rubric_bad', e.target.value)}
                                                    className="min-h-[160px] text-base border-2 border-red-200/50 dark:border-red-900/50 focus-visible:ring-red-500/20 bg-white dark:bg-transparent leading-relaxed font-readable"
                                                    placeholder="Warning signs to watch out for..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            ))}
            <div className="flex justify-between pt-6 pb-12">
                <Button variant="outline" onClick={onBack} size="lg" className="text-base">Back</Button>
                <Button onClick={onNext} disabled={loading || questions.length === 0} size="lg" className="text-base">
                    {loading ? 'Saving...' : 'Finalize Kit'}
                </Button>
            </div>
        </div>
    );
}

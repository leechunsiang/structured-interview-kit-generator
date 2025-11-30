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
    category: 'Competency' | 'Behavioral' | 'Situational';
    explanation: string;
    rubric_good: string;
    rubric_bad: string;
}

interface QuestionReviewProps {
    questions: Question[];
    setQuestions: (questions: Question[]) => void;
    onNext: () => void;
    onBack: () => void;
    loading: boolean;
}

export function QuestionReview({ questions, setQuestions, onNext, onBack, loading }: QuestionReviewProps) {

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
                    <CardContent className="space-y-10 pt-8">
                        {groupQuestions.map((q) => {
                            const realIndex = questions.indexOf(q);
                            return (
                                <div key={realIndex} className="group relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                                    {/* Header Section */}
                                    <div className="flex items-start justify-between p-6 pb-4">
                                        <div className="space-y-1">
                                            <Badge variant={q.category === 'Behavioral' ? 'default' : 'secondary'} className="mb-2 text-sm px-3 py-1">
                                                {q.category}
                                            </Badge>
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
                                    <div className="px-6 pb-6">
                                        <Textarea
                                            value={q.text}
                                            onChange={(e) => handleUpdate(realIndex, 'text', e.target.value)}
                                            className="min-h-[120px] text-xl font-semibold resize-none border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20 p-5 rounded-lg leading-relaxed"
                                            placeholder="Enter interview question..."
                                        />
                                    </div>

                                    {/* AI Insight */}
                                    <div className="px-6 pb-6">
                                        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                            <p className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">
                                                Why this question?
                                            </p>
                                            <p className="text-base text-blue-900/90 dark:text-blue-100 leading-relaxed">
                                                {q.explanation}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rubrics Grid */}
                                    <div className="grid md:grid-cols-2 border-t divide-y md:divide-y-0 md:divide-x">
                                        {/* Good Indicators */}
                                        <div className="p-6 bg-green-50/30 dark:bg-green-950/10">
                                            <label className="flex items-center gap-2 text-base font-bold text-green-800 dark:text-green-400 mb-3">
                                                <span className="h-3 w-3 rounded-full bg-green-600" />
                                                Positive Indicators
                                            </label>
                                            <Textarea
                                                value={q.rubric_good}
                                                onChange={(e) => handleUpdate(realIndex, 'rubric_good', e.target.value)}
                                                className="min-h-[140px] text-base border-green-200/50 dark:border-green-900/50 focus-visible:ring-green-500/20 bg-white/50 dark:bg-transparent leading-relaxed"
                                                placeholder="What to look for..."
                                            />
                                        </div>

                                        {/* Red Flags */}
                                        <div className="p-6 bg-red-50/30 dark:bg-red-950/10">
                                            <label className="flex items-center gap-2 text-base font-bold text-red-800 dark:text-red-400 mb-3">
                                                <span className="h-3 w-3 rounded-full bg-red-600" />
                                                Red Flags
                                            </label>
                                            <Textarea
                                                value={q.rubric_bad}
                                                onChange={(e) => handleUpdate(realIndex, 'rubric_bad', e.target.value)}
                                                className="min-h-[140px] text-base border-red-200/50 dark:border-red-900/50 focus-visible:ring-red-500/20 bg-white/50 dark:bg-transparent leading-relaxed"
                                                placeholder="Warning signs..."
                                            />
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

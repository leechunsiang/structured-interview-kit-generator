import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, Star, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import { type Question } from './QuestionReview';

interface KitPreviewProps {
    jobTitle: string;
    questions: Question[];
    onReset: () => void;
    viewOnly?: boolean;
    kitScore?: number;
    kitScoreExplanation?: string;
}

export function KitPreview({ jobTitle, questions, onReset, viewOnly = false, kitScore, kitScoreExplanation }: KitPreviewProps) {

    const handleExportPDF = () => {
        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(20);
        doc.text(`Interview Kit: ${jobTitle}`, 20, yPos);
        yPos += 15;

        // Score
        if (kitScore) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`Kit Quality Score: ${kitScore}/100`, 20, yPos);
            yPos += 10;

            if (kitScoreExplanation) {
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                const splitExplanation = doc.splitTextToSize(kitScoreExplanation, 170);
                doc.text(splitExplanation, 20, yPos);
                yPos += (splitExplanation.length * 5) + 10;
            }
        }

        // Group by competency
        const groupedQuestions = questions.reduce((acc, q) => {
            const key = q.competencyName || 'General';
            if (!acc[key]) acc[key] = [];
            acc[key].push(q);
            return acc;
        }, {} as Record<string, Question[]>);

        Object.entries(groupedQuestions).forEach(([competency, groupQuestions]) => {
            // Check page break
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Competency Header
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(competency, 20, yPos);
            yPos += 10;

            groupQuestions.forEach((q, index) => {
                if (yPos > 230) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(12);
                doc.setTextColor(50, 50, 50);

                // Question Text
                const splitText = doc.splitTextToSize(`${index + 1}. ${q.text}`, 170);
                doc.text(splitText, 20, yPos);
                yPos += (splitText.length * 7) + 5;

                // Rubric
                doc.setFontSize(10);
                doc.setTextColor(0, 100, 0); // Green
                const goodRubric = doc.splitTextToSize(`Good: ${q.rubric_good}`, 170);
                doc.text(goodRubric, 25, yPos);
                yPos += (goodRubric.length * 5) + 3;

                doc.setTextColor(150, 0, 0); // Red
                const badRubric = doc.splitTextToSize(`Bad: ${q.rubric_bad}`, 170);
                doc.text(badRubric, 25, yPos);
                yPos += (badRubric.length * 5) + 10;
            });

            yPos += 5;
        });

        doc.save(`${jobTitle.replace(/\s+/g, '_')}_Interview_Kit.pdf`);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {!viewOnly && (
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold">Interview Kit Ready!</h2>
                    <p className="text-muted-foreground">
                        Your structured interview kit for <strong>{jobTitle}</strong> has been generated and saved.
                    </p>
                </div>
            )}

            {/* Header with Actions */}
            <div className="flex items-center justify-between pb-6 border-b">
                <h3 className="text-2xl font-bold text-foreground">
                    {viewOnly ? 'Interview Kit' : 'Interview Kit Preview'}
                </h3>
                <div className="flex gap-3">
                    <Button onClick={handleExportPDF} variant="accent" size="lg">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    {!viewOnly && (
                        <Button variant="outline" onClick={onReset} size="lg">
                            Create Another Kit
                        </Button>
                    )}
                </div>
            </div>

            {/* Kit Score Section */}
            {kitScore !== undefined && kitScore > 0 && (
                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className={`flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center border-4 text-3xl font-bold ${kitScore >= 80 ? 'border-green-100 bg-green-50 text-green-700' :
                            kitScore >= 60 ? 'border-yellow-100 bg-yellow-50 text-yellow-700' :
                                'border-red-100 bg-red-50 text-red-700'
                        }`}>
                        {kitScore}
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <h4 className="text-lg font-semibold">AI Quality Assessment</h4>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            {kitScoreExplanation || "No explanation provided."}
                        </p>
                    </div>
                </div>
            )}

            <div className="text-left">
                <div className="space-y-8">
                    {questions.map((q, i) => (
                        <div key={i} className="rounded-xl border-2 bg-card shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                            {/* Question Header */}
                            <div className="flex items-center justify-between p-4 border-b bg-muted/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                                        {i + 1}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{q.competencyName}</span>
                                        <Badge variant="outline" className="ml-2">{q.category}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">
                                {/* Left Column: Question */}
                                <div className="lg:col-span-2 p-8 flex flex-col justify-center">
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                                        Question
                                    </label>
                                    <p className="text-xl font-semibold leading-relaxed question-text text-foreground">
                                        {q.text}
                                    </p>
                                    {q.explanation && (
                                        <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                            <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                                                <Info className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase">Why this question?</span>
                                            </div>
                                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                                {q.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Rubrics */}
                                <div className="lg:col-span-1 bg-muted/5 p-6 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                                            <span className="font-bold text-xs text-green-700 dark:text-green-400 uppercase tracking-wide">Good Signs</span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {q.rubric_good}
                                        </p>
                                    </div>

                                    <div className="h-px bg-border/50" />

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                                            <span className="font-bold text-xs text-red-700 dark:text-red-400 uppercase tracking-wide">Red Flags</span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {q.rubric_bad}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

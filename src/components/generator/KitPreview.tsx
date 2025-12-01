import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { type Question } from './QuestionReview';

interface KitPreviewProps {
    jobTitle: string;
    questions: Question[];
    onReset: () => void;
    viewOnly?: boolean;
}

export function KitPreview({ jobTitle, questions, onReset, viewOnly = false }: KitPreviewProps) {

    const handleExportPDF = () => {
        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(20);
        doc.text(`Interview Kit: ${jobTitle}`, 20, yPos);
        yPos += 15;

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
        <div className="max-w-3xl mx-auto space-y-8">
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

            <div className="text-left">
                <div className="space-y-6">
                    {questions.map((q, i) => (
                        <div key={i} className="rounded-xl border-2 bg-card shadow-md hover:shadow-lg transition-shadow">
                            {/* Question Header */}
                            <div className="flex items-center justify-between p-6 border-b bg-muted/10">
                                <div className="flex items-center gap-4">
                                    {/* Question Number */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{q.competencyName}</span>
                                        <Badge variant="outline" className="ml-2">{q.category}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className="px-8 py-6">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Question {i + 1}
                                </label>
                                <p className="text-xl font-semibold leading-relaxed question-text text-foreground">
                                    {q.text}
                                </p>
                            </div>

                            {/* Rubrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 pb-6">
                                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/10 rounded-lg border-2 border-green-200/50 dark:border-green-900/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="h-3 w-3 rounded-full bg-green-600" />
                                        <span className="font-bold text-sm text-green-800 dark:text-green-400 uppercase tracking-wide">✅ Good Signs</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-green-900 dark:text-green-100 font-readable">
                                        {q.rubric_good}
                                    </p>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/10 rounded-lg border-2 border-red-200/50 dark:border-red-900/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="h-3 w-3 rounded-full bg-red-600" />
                                        <span className="font-bold text-sm text-red-800 dark:text-red-400 uppercase tracking-wide">🚩 Red Flags</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-red-900 dark:text-red-100 font-readable">
                                        {q.rubric_bad}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

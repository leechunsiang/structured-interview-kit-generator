import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="max-w-3xl mx-auto text-center space-y-8">
            {!viewOnly && (
                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold">Interview Kit Ready!</h2>
                    <p className="text-muted-foreground">
                        Your structured interview kit for <strong>{jobTitle}</strong> has been generated and saved.
                    </p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{viewOnly ? 'Interview Kit Actions' : 'Actions'}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleExportPDF} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    {!viewOnly && (
                        <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
                            Create Another Kit
                        </Button>
                    )}
                </CardContent>
            </Card>

            <div className="text-left">
                <h3 className="text-xl font-semibold mb-4">Preview</h3>
                <div className="space-y-6">
                    {questions.map((q, i) => (
                        <div key={i} className="p-4 border rounded-md bg-card">
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-sm text-muted-foreground">{q.competencyName}</span>
                                <Badge variant="outline">{q.category}</Badge>
                            </div>
                            <p className="font-medium mb-4">{q.text}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-green-50 rounded border border-green-100">
                                    <span className="font-semibold text-green-700 block mb-1">Good Signs</span>
                                    {q.rubric_good}
                                </div>
                                <div className="p-3 bg-red-50 rounded border border-red-100">
                                    <span className="font-semibold text-red-700 block mb-1">Red Flags</span>
                                    {q.rubric_bad}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface JobInputFormProps {
    onNext: (jobData: { title: string; description: string }) => void;
    loading: boolean;
}

export function JobInputForm({ onNext, loading }: JobInputFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        let finalDescription = description;

        if (file && !description.trim()) {
            setParsing(true);
            try {
                finalDescription = await extractTextFromPdf(file);
                setDescription(finalDescription); // Update state for visibility
            } catch (error) {
                console.error('Error parsing PDF:', error);
                alert('Failed to parse PDF. Please try pasting the text manually.');
                setParsing(false);
                return;
            }
            setParsing(false);
        }

        if (!finalDescription.trim()) {
            alert('Please provide a job description.');
            return;
        }

        onNext({ title, description: finalDescription });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Enter the job title and description to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Senior Software Engineer"
                            required
                        />
                    </div>

                    <Tabs defaultValue="text" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Paste Text</TabsTrigger>
                            <TabsTrigger value="file">Upload PDF</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text">
                            <div className="space-y-2 mt-4">
                                <Label htmlFor="description">Job Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Paste the full job description here..."
                                    className="min-h-[200px]"
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="file">
                            <div className="space-y-4 mt-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="pdf">Job Description PDF</Label>
                                    <Input id="pdf" type="file" accept=".pdf" onChange={handleFileChange} />
                                </div>
                                {file && (
                                    <p className="text-sm text-muted-foreground">
                                        Selected: {file.name}
                                    </p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Button type="submit" className="w-full" disabled={loading || parsing}>
                        {parsing ? 'Parsing PDF...' : loading ? 'Analyzing...' : 'Analyze & Extract Competencies'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

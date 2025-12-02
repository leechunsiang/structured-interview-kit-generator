import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Progress } from '@/components/ui/progress';
import { Trash2, Plus, Loader2, Sparkles } from 'lucide-react';

export interface Competency {
    id?: string;
    name: string;
    description: string;
}

interface CompetencyListProps {
    competencies: Competency[];
    setCompetencies: (competencies: Competency[]) => void;
    onNext: () => void;
    onBack: () => void;
    loading: boolean;
    progress?: number;
    loadingStatus?: string;
    onSuggestMore: () => void;
    isSuggesting?: boolean;
}

export function CompetencyList({ competencies, setCompetencies, onNext, onBack, loading, progress, loadingStatus, onSuggestMore, isSuggesting }: CompetencyListProps) {
    const [newCompName, setNewCompName] = useState('');
    const [newCompDesc, setNewCompDesc] = useState('');

    const handleAdd = () => {
        if (!newCompName.trim()) return;
        setCompetencies([...competencies, { name: newCompName, description: newCompDesc }]);
        setNewCompName('');
        setNewCompDesc('');
    };

    const handleDelete = (index: number) => {
        const newComps = [...competencies];
        newComps.splice(index, 1);
        setCompetencies(newComps);
    };

    const handleUpdate = (index: number, field: 'name' | 'description', value: string) => {
        const newComps = [...competencies];
        newComps[index] = { ...newComps[index], [field]: value };
        setCompetencies(newComps);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Review Competencies</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    We've extracted these key competencies from the job description.
                    Review and refine them to ensure they match your requirements.
                </p>
            </div>

            <div className="grid gap-6">
                {Array.isArray(competencies) && competencies.map((comp, index) => (
                    <div
                        key={index}
                        className="group relative bg-card hover:bg-accent/5 rounded-xl border border-border shadow-subtle hover:shadow-medium transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/70 group-hover:bg-primary transition-colors" />

                        <div className="p-6 pl-8 flex gap-6 items-start">
                            <div className="flex-1 space-y-3">
                                <div className="relative">
                                    <Input
                                        value={comp.name}
                                        onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                                        placeholder="Competency Name"
                                        className="text-lg font-semibold border-transparent bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:border-primary/50 placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        value={comp.description}
                                        onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                                        placeholder="Description"
                                        className="text-sm text-muted-foreground border-transparent bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:border-primary/50 placeholder:text-muted-foreground/50 w-full"
                                    />
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ))}

                <div className="relative group rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5 transition-all duration-300 p-6">
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-4">
                            <Input
                                value={newCompName}
                                onChange={(e) => setNewCompName(e.target.value)}
                                placeholder="Add a new competency..."
                                className="bg-transparent border-none shadow-none text-lg font-medium placeholder:text-muted-foreground/70 focus-visible:ring-0 px-0"
                            />
                            <Input
                                value={newCompDesc}
                                onChange={(e) => setNewCompDesc(e.target.value)}
                                placeholder="Describe the requirements for this competency..."
                                className="bg-transparent border-none shadow-none text-sm text-muted-foreground focus-visible:ring-0 px-0"
                            />
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onSuggestMore}
                                    disabled={loading || isSuggesting}
                                    className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20"
                                >
                                    {isSuggesting ? (
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-3 w-3" />
                                    )}
                                    Suggest more with AI
                                </Button>
                            </div>
                        </div>
                        <Button
                            onClick={handleAdd}
                            size="icon"
                            className="rounded-full h-10 w-10 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            disabled={!newCompName.trim()}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t">
                <Button variant="outline" onClick={onBack} disabled={loading} className="px-6">
                    Back
                </Button>

                <div className="flex-1 flex justify-end items-center gap-6">
                    {loading && (
                        <div className="flex-1 max-w-xs flex flex-col gap-2">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>{loadingStatus || 'Processing...'}</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    <Button
                        onClick={onNext}
                        disabled={loading || competencies.length === 0}
                        className="min-w-[180px] px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : 'Generate Questions'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

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
}

export function CompetencyList({ competencies, setCompetencies, onNext, onBack, loading }: CompetencyListProps) {
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
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Review Competencies</CardTitle>
                <CardDescription>We extracted these competencies from the JD. Add, edit, or remove them as needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {Array.isArray(competencies) && competencies.map((comp, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 border rounded-md bg-card">
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={comp.name}
                                    onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                                    placeholder="Competency Name"
                                    className="font-semibold"
                                />
                                <Input
                                    value={comp.description}
                                    onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                                    placeholder="Description"
                                    className="text-sm text-muted-foreground"
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border border-dashed rounded-md bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">Add New Competency</h4>
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                            <Input
                                value={newCompName}
                                onChange={(e) => setNewCompName(e.target.value)}
                                placeholder="Name (e.g. Leadership)"
                            />
                            <Input
                                value={newCompDesc}
                                onChange={(e) => setNewCompDesc(e.target.value)}
                                placeholder="Description"
                            />
                        </div>
                        <Button onClick={handleAdd} size="icon" className="mt-auto">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    <Button onClick={onNext} disabled={loading || competencies.length === 0}>
                        {loading ? 'Generating Questions...' : 'Generate Questions'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

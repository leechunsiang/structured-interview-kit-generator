import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Organization {
    id: string;
    name: string;
    role: string;
}

export function Generator() {
    const { user, signOut } = useAuth();
    const [org, setOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [newOrgName, setNewOrgName] = useState('');
    const [creatingOrg, setCreatingOrg] = useState(false);

    const fetchOrg = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select(`
                organization_id,
                organizations (
                    id,
                    name
                )
            `)
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching org:', error);
        } else if (data && data.organizations) {
            setOrg({
                id: (data.organizations as any).id,
                name: (data.organizations as any).name,
                role: 'admin',
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrg();
    }, [user]);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;

        setCreatingOrg(true);
        try {
            const { error } = await supabase.rpc('create_organization', {
                org_name: newOrgName,
            });

            if (error) throw error;

            // Refresh org data
            await fetchOrg();
        } catch (error) {
            console.error('Error creating organization:', error);
            alert('Failed to create organization. Please try again.');
        } finally {
            setCreatingOrg(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Interview Kit Generator</h1>
                <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {user?.user_metadata?.full_name}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading organization details...</p>
                    ) : org ? (
                        <div className="space-y-2">
                            <p><strong>Organization:</strong> {org.name}</p>
                            <p><strong>Your Role:</strong> {org.role}</p>
                            <div className="mt-4 p-4 border rounded-md bg-muted">
                                <p className="text-muted-foreground italic">Generator functionality coming soon...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Create Organization</CardTitle>
                                    <CardDescription>You need to belong to an organization to use this tool.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateOrg} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="orgName">Organization Name</Label>
                                            <Input
                                                id="orgName"
                                                value={newOrgName}
                                                onChange={(e) => setNewOrgName(e.target.value)}
                                                placeholder="Enter organization name"
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={creatingOrg}>
                                            {creatingOrg ? 'Creating...' : 'Create Organization'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

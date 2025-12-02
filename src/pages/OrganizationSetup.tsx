import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function OrganizationSetup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create Mode State
    const [orgName, setOrgName] = useState('');

    // Join Mode State
    const [inviteCode, setInviteCode] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Check if already has org
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (profile?.organization_id) {
                navigate('/generator');
            }
        };
        checkUser();
    }, [navigate]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.rpc('create_organization', {
                org_name: orgName
            });

            if (error) throw error;
            navigate('/generator');
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.rpc('join_organization_by_code', {
                code: inviteCode.trim()
            });

            if (error) throw error;
            navigate('/generator');
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome!</CardTitle>
                    <CardDescription>Setup your organization to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs defaultValue="create" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="create">Create New</TabsTrigger>
                            <TabsTrigger value="join">Join Existing</TabsTrigger>
                        </TabsList>

                        <TabsContent value="create">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="orgName">Organization Name</Label>
                                    <Input
                                        id="orgName"
                                        placeholder="Acme Corp"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Organization'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="join">
                            <form onSubmit={handleJoin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="inviteCode">Invite Code</Label>
                                    <Input
                                        id="inviteCode"
                                        placeholder="ENTER-CODE"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Joining...' : 'Join Organization'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

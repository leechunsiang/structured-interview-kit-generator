import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Loader2, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface Member {
    id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'member';
}

export function Organization() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [orgName, setOrgName] = useState('');
    const [orgId, setOrgId] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member'>('member');
    const [error, setError] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        fetchOrgData();
    }, [user]);

    const fetchOrgData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Get current user's profile and org
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id, role, organizations(id, name, invite_code)')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) return;

            const org = profile.organizations as any;
            setOrgName(org?.name || 'Organization');
            setOrgId(org?.id);
            setInviteCode(org?.invite_code || '');
            setCurrentUserRole(profile.role as 'admin' | 'member');

            // Fetch Members
            const { data: membersData } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .eq('organization_id', profile.organization_id);

            if (membersData) setMembers(membersData as Member[]);

        } catch (err) {
            console.error('Error fetching org data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        toast.success('Invite code copied to clipboard');
    };

    const handleRegenerateCode = async () => {
        if (!confirm('Are you sure? The old code will stop working immediately.')) return;

        setRegenerating(true);
        try {
            const { data, error } = await supabase.rpc('regenerate_invite_code', {
                org_id: orgId
            });

            if (error) throw error;
            setInviteCode(data);
            toast.success('Invite code regenerated');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setRegenerating(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this user?')) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ organization_id: null, role: 'member' }) // Reset role too
                .eq('id', memberId);

            if (error) throw error;
            fetchOrgData();
            toast.success('Member removed');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleChangeRole = async (memberId: string, newRole: 'admin' | 'member') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', memberId);

            if (error) throw error;
            fetchOrgData();
            toast.success('Role updated');
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{orgName}</h1>
                    <p className="text-muted-foreground">Manage your organization members and settings.</p>
                </div>
            </div>

            {currentUserRole === 'admin' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Invite Code</CardTitle>
                        <CardDescription>Share this code with people you want to invite to your organization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-muted rounded-lg font-mono text-2xl tracking-widest font-bold select-all">
                                {inviteCode}
                            </div>
                            <Button variant="outline" size="icon" onClick={handleCopyCode} title="Copy Code">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRegenerateCode}
                                disabled={regenerating}
                                title="Regenerate Code"
                            >
                                <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Anyone with this code can join your organization as a member.
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Members</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                {currentUserRole === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.full_name}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    {currentUserRole === 'admin' && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                {member.id !== user?.id && (
                                                    <>
                                                        <Select
                                                            value={member.role}
                                                            onValueChange={(v: 'admin' | 'member') => handleChangeRole(member.id, v)}
                                                        >
                                                            <SelectTrigger className="w-[100px] h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="member">Member</SelectItem>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive/90"
                                                            onClick={() => handleRemoveMember(member.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

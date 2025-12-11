'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Terminal } from 'lucide-react';

function DeviceAuthContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get('code');
    const supabase = createClient();
    
    const [status, setStatus] = useState<'loading' | 'confirm' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Redirect to login if not authenticated, passing the return URL
                const returnUrl = encodeURIComponent(`/auth/device?code=${code}`);
                router.push(`/login?next=${returnUrl}`);
                return;
            }
            setUser(user);
            
            if (code) {
                setStatus('confirm');
            } else {
                setStatus('error');
                setErrorMsg('No device code provided.');
            }
        };

        checkSession();
    }, [code, router, supabase.auth]);

    const handleApprove = async () => {
        if (!user || !code) return;
        setStatus('loading');

        try {
            const { error } = await supabase
                .from('device_requests')
                .update({ 
                    status: 'approved',
                    user_id: user.id
                })
                .eq('device_code', code)
                .select();

            if (error) throw error;
            setStatus('success');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMsg('Failed to approve device. The code may be expired or invalid.');
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
                <p className="text-muted-foreground">Verifying session...</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Card className="w-full max-w-md bg-card border-accent/50 shadow-2xl shadow-accent/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-success/10 p-4 rounded-full w-fit mb-4 border border-success/20">
                            <CheckCircle className="h-8 w-8 text-success" />
                        </div>
                        <CardTitle className="text-2xl text-foreground">Successfully Authenticated</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            You can now close this window and return to your terminal.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Card className="w-full max-w-md bg-card border-destructive/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4 border border-destructive/20">
                            <XCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl text-foreground">Authentication Failed</CardTitle>
                        <CardDescription className="text-destructive">
                            {errorMsg}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
             <Card className="w-full max-w-md bg-card border-border shadow-xl">
                <CardHeader>
                    <div className="flex items-center justify-center mb-6">
                         <div className="p-4 bg-secondary rounded-xl">
                            <Terminal className="h-8 w-8 text-foreground" />
                         </div>
                    </div>
                    <CardTitle className="text-center text-foreground text-xl">Authorize CLI</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Do you want to authorize the Loophole CLI to access your account?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-black/50 p-6 rounded-lg border border-border font-mono text-center text-2xl tracking-widest text-accent font-bold shadow-inner">
                        {code}
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="w-full border-border hover:bg-secondary text-foreground" onClick={() => setStatus('error')}>
                            Cancel
                        </Button>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-white font-bold" onClick={handleApprove}>
                            Authorize
                        </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                        Signed in as <span className="text-foreground">{user?.email}</span>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function DeviceAuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>}>
            <DeviceAuthContent />
        </Suspense>
    );
}

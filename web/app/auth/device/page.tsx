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
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
                <p>Verifying session...</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
                <Card className="w-full max-w-md bg-slate-900 border-emerald-500/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-emerald-500/10 p-3 rounded-full w-fit mb-4">
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                        </div>
                        <CardTitle className="text-2xl text-white">Successfully Authenticated</CardTitle>
                        <CardDescription className="text-slate-400">
                            You can now close this window and return to your terminal.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
                <Card className="w-full max-w-md bg-slate-900 border-red-500/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-4">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <CardTitle className="text-2xl text-white">Authentication Failed</CardTitle>
                        <CardDescription className="text-red-400">
                            {errorMsg}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
             <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                         <Terminal className="h-10 w-10 text-slate-400" />
                    </div>
                    <CardTitle className="text-center text-white text-xl">Authorize CLI</CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        Do you want to authorize the Loophole CLI to access your account?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-center text-sm text-yellow-400">
                        {code}
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-white" onClick={() => setStatus('error')}>
                            Cancel
                        </Button>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApprove}>
                            Authorize
                        </Button>
                    </div>
                    <p className="text-xs text-center text-slate-500">
                        Signed in as {user?.email}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function DeviceAuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <DeviceAuthContent />
        </Suspense>
    );
}

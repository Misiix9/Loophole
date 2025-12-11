'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2, Users } from 'lucide-react';

export function SharedTunnelsList() {
    const [tunnels, setTunnels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchShared = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch shares first, then tunnels
            // (Or use the policy we set up where we can just query tunnels directly with the helper? 
            // Actually, we set up a policy "Shared users can view tunnels". 
            // So we can query tunnels where we are NOT the owner but HAVE access.)
            
            // However, Supabase standard query filters don't easily do "where am NOT owner but CAN see".
            // RLS filters the rows, but we need to distinguish them in the UI.
            
            // Let's query 'tunnel_shares' to get the IDs, then fetch the tunnels.
            const { data: shares } = await supabase
                .from('tunnel_shares')
                .select('tunnel_id, role')
                .eq('shared_with_email', user.email);

            if (shares && shares.length > 0) {
                const ids = shares.map(s => s.tunnel_id);
                const { data: sharedTunnels } = await supabase
                    .from('tunnels')
                    .select('*')
                    .in('id', ids);
                
                setTunnels(sharedTunnels || []);
            } else {
                setTunnels([]);
            }
            setLoading(false);
        };

        fetchShared();
        
        // Subscribe to changes? For now, just fetch on mount.
    }, [supabase]);

    if (loading) {
         return <div className="py-4 text-center text-slate-500"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>;
    }

    if (tunnels.length === 0) {
        return (
            <div className="border border-slate-800 rounded-lg p-6 text-center text-slate-500 border-dashed">
                <p>No tunnels have been shared with you yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tunnels.map((tunnel) => (
                <Card key={tunnel.id} className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium truncate pr-2">
                            {tunnel.project_name || 'Untitled Project'}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                            Shared
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold flex items-center gap-2 mb-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${tunnel.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                            <span className="truncate">{tunnel.current_url}</span>
                        </div>
                         
                        <div className="flex justify-between items-center text-xs text-slate-400 mt-4">
                             {tunnel.status === 'online' ? (
                                <a 
                                    href={tunnel.current_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                                >
                                    Open App <ExternalLink className="h-3 w-3" />
                                </a>
                             ) : (
                                 <span>Offline</span>
                             )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

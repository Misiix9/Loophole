"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Tunnel = {
  id: string;
  project_name: string;
  current_url: string;
  status: string;
  created_at: string;
};

export default function CommunityPage() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicTunnels = async () => {
      // Fetch ONLY public and online tunnels
      const { data, error } = await supabase
        .from('tunnels')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'online')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public tunnels:', error);
      } else {
        setTunnels(data || []);
      }
      setIsLoading(false);
    };

    fetchPublicTunnels();
    
    // Realtime subscription for public tunnels could be good, but polling is safer for now?
    // Let's just stick to initial fetch for simplicity in Phase 2.3
  }, []);

  const filteredTunnels = tunnels.filter(t => 
    (t.project_name || 'Untitled').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Community Tunnels
          </h1>
          <p className="text-slate-400">
            Explore public projects shared by the Loophole community.
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                    placeholder="Search projects..." 
                    className="pl-9 bg-slate-900 border-slate-800 focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Link href="/dashboard">
                <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                    My Dashboard
                </Button>
            </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
             <div className="col-span-full text-center py-20 text-slate-500 animate-pulse">
                Loading community projects...
             </div>
        ) : filteredTunnels.length === 0 ? (
            <div className="col-span-full text-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                <p className="text-slate-400 text-lg">No public tunnels found right now.</p>
                <p className="text-sm text-slate-500 mt-2">
                    Start a public tunnel with <code className="bg-slate-950 px-1 py-0.5 rounded text-purple-400">loophole start 3000 --public</code>
                </p>
            </div>
        ) : (
            filteredTunnels.map((tunnel) => (
                <Card key={tunnel.id} className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-colors group">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg text-purple-200 group-hover:text-purple-300 transition-colors">
                                    {tunnel.project_name || 'Untitled Project'}
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-xs mt-1">
                                    Launched {new Date(tunnel.created_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="p-3 bg-slate-950 rounded border border-slate-800/50 font-mono text-xs text-slate-300 break-all opacity-80 group-hover:opacity-100 transition-opacity">
                            {tunnel.current_url}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <a 
                            href={tunnel.current_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full"
                        >
                            <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white">
                                Visit Site
                            </Button>
                        </a>
                    </CardFooter>
                </Card>
            ))
        )}
      </main>
    </div>
  );
}

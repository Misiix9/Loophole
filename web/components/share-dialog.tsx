'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Loader2, Check } from 'lucide-react';

interface ShareDialogProps {
  tunnelId: string;
  projectName: string;
}

export function ShareDialog({ tunnelId, projectName }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = createClient();

  const handleShare = async () => {
    if (!email) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      // 0. Get current user for the email "From" field
      const { data: { user } } = await supabase.auth.getUser();
      const senderName = user?.user_metadata?.full_name || user?.email || 'A Loophole User';

      // 1. Share in Database
      const { error } = await supabase
        .from('tunnel_shares')
        .insert({
          tunnel_id: tunnelId,
          shared_with_email: email.trim().toLowerCase(),
          role: 'viewer'
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
             throw new Error('This user already has access.');
        }
        throw error;
      };

      // 2. Send Invitation Email
      // Note: We don't block UI on this, or we do? Let's await it to show real error if key is missing.
      const response = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              email: email.trim(),
              projectName: projectName,
              senderName: senderName,
              link: `${window.location.origin}/dashboard?tab=shared`
          })
      });
      
      const emailResult = await response.json();
      if (!response.ok) {
          console.error("Email failed:", emailResult);
          // Don't throw, just log. The share *did* work.
      } else if (emailResult.mock) {
          console.log("Mock email sent (Check server console)");
      }

      // 3. Clear input and show success
      setEmail('');
      setStatus('success');
      
      // Reset success message after 2s
      setTimeout(() => {
          setStatus('idle');
          setOpen(false);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to share tunnel');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Share "{projectName}"</DialogTitle>
          <DialogDescription className="text-slate-400">
            Invite others to view this tunnel. They will see it in their "Shared with Me" tab.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
        
        {status === 'error' && (
            <p className="text-sm text-red-400">{errorMsg}</p>
        )}
        
        {status === 'success' && (
             <p className="text-sm text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4" /> Invited successfully
             </p>
        )}

        <DialogFooter className="justify-end">
          <Button 
            type="button" 
            onClick={handleShare} 
            disabled={status === 'loading' || status === 'success'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === 'success' ? 'Invite Sent' : 'Send Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

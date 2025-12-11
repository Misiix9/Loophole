'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, Loader2, X, AlertTriangle } from "lucide-react"
import Link from 'next/link'

const TextFlow = ({ text, className = "" }: { text: string, className?: string }) => (
  <div className={`relative overflow-hidden h-[1.2em] flex items-center justify-center ${className}`}>
    <div key={text} className="animate-in slide-in-from-bottom-full duration-500 fill-mode-both ease-[cubic-bezier(0.33,1,0.68,1)]">
        {text}
    </div>
  </div>
)

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) } 
    else { router.push('/dashboard'); router.refresh() }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) } 
    else { setError('Check your email for the confirmation link.'); setLoading(false) }
  }

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider, options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const handleSubmit = (e: React.FormEvent) => {
      if (activeTab === 'login') handleEmailLogin(e)
      else handleSignUp(e)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse duration-[7s]" />

      <Card className="w-full max-w-md bg-card border-border shadow-2xl relative animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards">
        <Link href="/" className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all hover:rotate-90 duration-300 group">
           <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </Link>
        <CardHeader className="text-center space-y-4 pt-8 pb-6">
           <div className="mx-auto h-12 w-12 bg-accent rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-accent/20 mb-2 transition-transform hover:scale-110 hover:rotate-3 duration-300 cursor-default select-none">L</div>
          
           <div className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex justify-center">
                    <TextFlow 
                        text={activeTab === 'login' ? 'Welcome Back' : 'Join Loophole'} 
                        className="h-8"
                    />
                </CardTitle>
                <CardDescription className="flex justify-center">
                    <TextFlow 
                        text={activeTab === 'login' ? 'Sign in to manage your tunnels' : 'Create an account to get started'} 
                        className="h-5 w-full text-muted-foreground"
                    />
                </CardDescription>
           </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
            
            {/* Custom Sliding Tabs */}
            <div className="relative w-full h-10 bg-zinc-950/50 rounded-lg p-1 grid grid-cols-2 mb-6">
                <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 rounded-md shadow-sm transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${activeTab === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'}`} 
                />
                
                <button 
                    onClick={() => setActiveTab('login')}
                    className={`relative z-10 text-sm font-medium transition-colors duration-200 ${activeTab === 'login' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                    Login
                </button>
                <button 
                    onClick={() => setActiveTab('register')}
                    className={`relative z-10 text-sm font-medium transition-colors duration-200 ${activeTab === 'register' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-secondary/30 border-border focus:border-accent focus:ring-accent/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-secondary/30 border-border focus:border-accent focus:ring-accent/20 transition-all duration-200"
                  />
                </div>
                
                <div className="min-h-[20px]">
                    {error && (
                        <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-11 shadow-lg shadow-accent/10 active:scale-[0.98] transition-all duration-200 overflow-hidden" disabled={loading}>
                  {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <TextFlow 
                        text={activeTab === 'login' ? 'Sign In' : 'Create Account'} 
                        className="h-full w-full"
                      />
                  )}
                </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium tracking-wider">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="w-full bg-card border-border hover:bg-secondary text-foreground h-10 hover:border-accent/50 transition-colors duration-300" onClick={() => handleOAuthLogin('github')} disabled={loading}>
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button type="button" variant="outline" className="w-full bg-card border-border hover:bg-secondary text-foreground h-10 hover:border-accent/50 transition-colors duration-300" onClick={() => handleOAuthLogin('google')} disabled={loading}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Google
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

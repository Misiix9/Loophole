"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { Plus } from "lucide-react"

export function CreateTeamDialog({ onTeamCreated, children }: { onTeamCreated: () => void, children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
// ... existing logic ...
  const handleCreate = async () => {
    // ... existing logic ...
    setLoading(true)
    try {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id

        if (!userId) {
            alert("You must be logged in to create a team.")
            setLoading(false)
            return
        }

        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .insert({
                name,
                slug,
                owner_id: userId
            })
            .select()
            .single()
        
        if (teamError) throw teamError

        const { error: memberError } = await supabase
            .from('team_members')
            .insert({
                team_id: teamData.id,
                user_id: userId,
                role: 'admin'
            })
        
        if (memberError) {
            console.error("Failed to add member:", memberError)
            alert("Team created but failed to join as member. Please contact support.")
        }

        setName("")
        setSlug("")
        setOpen(false)
        onTeamCreated()
    } catch (error: any) {
        alert(error.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : (
            <Button variant="outline" size="sm" className="w-full justify-start text-xs border-dashed gap-2">
                <Plus className="h-3 w-3" /> Create Team
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new workspace for your team.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                  setName(e.target.value)
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))
              }}
              className="col-span-3 bg-secondary/30 border-border focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right">
              Slug
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="col-span-3 bg-secondary/30 border-border focus:border-accent"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate} disabled={loading} className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20">
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

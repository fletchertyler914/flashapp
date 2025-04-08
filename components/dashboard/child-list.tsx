"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-auth-helpers"
import type { Database } from "@/types/supabase"
import { useRouter } from "next/navigation"
import { BarChart, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Child = Database["public"]["Tables"]["children"]["Row"]

export function ChildList() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data, error } = await supabase.from("children").select("*").order("name")

        if (error) throw error

        setChildren(data || [])
      } catch (error: any) {
        setError(error.message || "Failed to load children")
      } finally {
        setLoading(false)
      }
    }

    fetchChildren()
  }, [supabase])

  const startPractice = (childId: string) => {
    router.push(`/practice/${childId}`)
  }

  const viewProgress = (childId: string) => {
    router.push(`/progress/${childId}`)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error)
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  if (children.length === 0) return <div className="text-center py-8">No children added yet.</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Children</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardHeader className="bg-secondary">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {child.name} {child.age && `(${child.age})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => startPractice(child.id)}
                  className="w-full justify-start gap-2 border-2 border-black dark:border-white"
                >
                  <span className="text-xl">🎮</span> Start Practice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => viewProgress(child.id)}
                  className="w-full justify-start gap-2 border-2 border-black dark:border-white"
                >
                  <BarChart className="h-5 w-5" /> View Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

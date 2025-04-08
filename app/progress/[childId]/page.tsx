"use client"

import { useState, useEffect } from "react"
import { ProgressChart } from "@/components/progress/progress-chart"
import { SessionHistory } from "@/components/progress/session-history"
import { LearningCurveChart } from "@/components/progress/learning-curve-chart"
import { createClient } from "@/lib/supabase-auth-helpers"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play } from "lucide-react"

export default function ProgressPage({ params }: { params: { childId: string } }) {
  const [childName, setChildName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchChildInfo = async () => {
      try {
        // Check if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession()

        // Don't redirect if no session, let the auth state handle that
        if (!sessionData.session) {
          setLoading(false)
          return
        }

        // Fetch child info
        const { data, error } = await supabase.from("children").select("name").eq("id", params.childId).single()

        if (error) throw error
        if (!data) throw new Error("Child not found")

        setChildName(data.name)
      } catch (error: any) {
        setError(error.message || "Failed to load child information")
      } finally {
        setLoading(false)
      }
    }

    fetchChildInfo()
  }, [params.childId, router, supabase])

  // Add auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-dot-pattern">
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{childName}'s Progress</h1>
          </div>
          <Button onClick={() => router.push(`/practice/${params.childId}`)} className="gap-2">
            <Play className="h-4 w-4" /> Practice
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <LearningCurveChart childId={params.childId} />
        <ProgressChart childId={params.childId} />
        <SessionHistory childId={params.childId} />
      </main>
    </div>
  )
}

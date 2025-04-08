"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Calendar, Users } from "lucide-react"

interface DashboardStatsProps {
  parentId: string
}

export function DashboardStats({ parentId }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalSessions: 0,
    totalCharactersLearned: 0,
    lastPracticeDate: null as string | null,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total children
        const { data: children, error: childrenError } = await supabase
          .from("children")
          .select("id")
          .eq("parent_id", parentId)

        if (childrenError) throw childrenError

        const childIds = children?.map((c) => c.id) || []

        if (childIds.length === 0) {
          setStats({
            totalChildren: 0,
            totalSessions: 0,
            totalCharactersLearned: 0,
            lastPracticeDate: null,
          })
          setLoading(false)
          return
        }

        // Get total sessions
        const { count: sessionsCount, error: sessionsError } = await supabase
          .from("practice_sessions")
          .select("id", { count: "exact", head: true })
          .in("child_id", childIds)

        if (sessionsError) throw sessionsError

        // Get last practice date
        const { data: lastSession, error: lastSessionError } = await supabase
          .from("practice_sessions")
          .select("ended_at")
          .in("child_id", childIds)
          .order("ended_at", { ascending: false })
          .limit(1)

        if (lastSessionError) throw lastSessionError

        // Get total characters learned (>= 70% correct)
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("correct, incorrect")
          .in("child_id", childIds)

        if (progressError) throw progressError

        const learnedCharacters =
          progressData?.filter((p) => {
            const total = p.correct + p.incorrect
            return total > 0 && p.correct / total >= 0.7
          }).length || 0

        setStats({
          totalChildren: childIds.length,
          totalSessions: sessionsCount || 0,
          totalCharactersLearned: learnedCharacters,
          lastPracticeDate: lastSession?.[0]?.ended_at || null,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (parentId) {
      fetchStats()
    }
  }, [parentId, supabase])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-32 bg-gray-100 dark:bg-gray-800"></Card>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Children</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChildren}</div>
          <p className="text-xs text-muted-foreground">{stats.totalChildren === 1 ? "Child" : "Children"} registered</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Characters Learned</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCharactersLearned}</div>
          <p className="text-xs text-muted-foreground">With at least 70% recognition rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Last Practice</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDate(stats.lastPracticeDate)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSessions} total {stats.totalSessions === 1 ? "session" : "sessions"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

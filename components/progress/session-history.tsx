"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"
import { format } from "date-fns"

type Session = Database["public"]["Tables"]["practice_sessions"]["Row"] & {
  session_results: {
    result: boolean
  }[]
}

interface SessionHistoryProps {
  childId: string
}

export function SessionHistory({ childId }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from("practice_sessions")
          .select(`
            *,
            session_results (result)
          `)
          .eq("child_id", childId)
          .order("started_at", { ascending: false })
          .limit(10)

        if (error) throw error

        setSessions(data || [])
      } catch (error: any) {
        setError(error.message || "Failed to load session history")
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [childId])

  if (loading) return <div className="text-center py-8">Loading session history...</div>
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>
  if (sessions.length === 0) return <div className="text-center py-8">No practice sessions yet.</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Practice Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const correctCount = session.session_results.filter((r) => r.result).length
            const totalCount = session.session_results.length
            const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

            return (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{format(new Date(session.started_at), "MMM d, yyyy")}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(session.started_at), "h:mm a")}
                      {session.duration && ` • ${Math.floor(session.duration / 60)}m ${session.duration % 60}s`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {correctCount} / {totalCount} correct
                    </div>
                    <div
                      className={`text-sm ${
                        percentage >= 80
                          ? "text-green-600 dark:text-green-400"
                          : percentage >= 50
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {percentage}% accuracy
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

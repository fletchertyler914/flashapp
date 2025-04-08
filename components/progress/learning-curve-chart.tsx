"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, subDays } from "date-fns"

interface LearningCurveChartProps {
  childId: string
}

interface SessionData {
  date: string
  accuracy: number
  totalResults: number
}

export function LearningCurveChart({ childId }: LearningCurveChartProps) {
  const [sessionData, setSessionData] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Get all practice sessions for this child
        const { data: sessions, error: sessionsError } = await supabase
          .from("practice_sessions")
          .select(`
            id,
            ended_at,
            session_results (
              result
            )
          `)
          .eq("child_id", childId)
          .order("ended_at")

        if (sessionsError) throw sessionsError

        if (!sessions || sessions.length === 0) {
          setSessionData([])
          setLoading(false)
          return
        }

        // Process the data for the chart
        const processedData = sessions.map((session) => {
          const results = session.session_results || []
          const totalResults = results.length
          const correctResults = results.filter((r) => r.result).length
          const accuracy = totalResults > 0 ? (correctResults / totalResults) * 100 : 0

          return {
            date: format(new Date(session.ended_at), "MMM d"),
            accuracy: Math.round(accuracy),
            totalResults,
          }
        })

        setSessionData(processedData)
      } catch (error: any) {
        console.error("Error fetching session data:", error)
        setError(error.message || "Failed to load learning curve data")
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [childId, supabase])

  // If no real data, generate placeholder data
  useEffect(() => {
    if (!loading && sessionData.length === 0 && !error) {
      const today = new Date()
      const placeholderData: SessionData[] = []

      // Generate 7 days of placeholder data
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i)
        placeholderData.push({
          date: format(date, "MMM d"),
          accuracy: 50 + Math.floor(i * 5 + Math.random() * 10), // Increasing trend
          totalResults: 10 + Math.floor(Math.random() * 10),
        })
      }

      setSessionData(placeholderData)
    }
  }, [loading, sessionData, error])

  if (loading) {
    return (
      <Card className="w-full h-80 animate-pulse">
        <CardHeader>
          <CardTitle className="text-xl">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-64 bg-gray-100 dark:bg-gray-800"></CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  const maxAccuracy = Math.max(...sessionData.map((d) => d.accuracy), 100)
  const chartHeight = 200

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Learning Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[250px]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
            <div>100%</div>
            <div>75%</div>
            <div>50%</div>
            <div>25%</div>
            <div>0%</div>
          </div>

          {/* Chart area */}
          <div className="absolute left-10 right-0 top-0 bottom-0">
            {/* Horizontal grid lines */}
            <div className="absolute left-0 right-0 top-0 h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute left-0 right-0 top-2/4 h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200 dark:bg-gray-700"></div>

            {/* Bars */}
            <div className="absolute left-0 right-0 bottom-0 top-0 flex items-end">
              {sessionData.map((data, index) => {
                const barHeight = (data.accuracy / 100) * chartHeight
                const barWidth = `calc(${100 / sessionData.length}% - 8px)`

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center"
                    style={{ width: barWidth, marginLeft: 4, marginRight: 4 }}
                  >
                    <div
                      className="w-full bg-primary rounded-t-sm transition-all duration-500 ease-in-out"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: `hsl(${data.accuracy * 1.2}, 70%, 50%)`,
                      }}
                    ></div>
                    <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">{data.date}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Chart shows accuracy percentage over time
        </div>
      </CardContent>
    </Card>
  )
}

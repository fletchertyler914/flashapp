"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Progress = Database["public"]["Tables"]["progress"]["Row"] & {
  characters: { value: string; type: string }
}

interface ProgressChartProps {
  childId: string
}

export function ProgressChart({ childId }: ProgressChartProps) {
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"letters" | "numbers">("letters")

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("progress")
          .select(`
            *,
            characters (value, type)
          `)
          .eq("child_id", childId)
          .order("character_id")

        if (error) throw error

        setProgress(data || [])
      } catch (error: any) {
        setError(error.message || "Failed to load progress data")
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [childId])

  if (loading) return <div className="text-center py-8">Loading progress data...</div>
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>
  if (progress.length === 0) return <div className="text-center py-8">No progress data available yet.</div>

  const letterProgress = progress.filter((p) => p.characters.type === "letter")
  const numberProgress = progress.filter((p) => p.characters.type === "number")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recognition Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="letters">Letters</TabsTrigger>
            <TabsTrigger value="numbers">Numbers</TabsTrigger>
          </TabsList>

          <TabsContent value="letters" className="space-y-4">
            <div className="grid grid-cols-5 gap-2 md:grid-cols-7">
              {letterProgress.map((item) => {
                const total = item.correct + item.incorrect
                const percentage = total > 0 ? Math.round((item.correct / total) * 100) : 0

                return (
                  <div
                    key={item.id}
                    className={`aspect-square flex items-center justify-center rounded-lg border-2 ${
                      percentage >= 80
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : percentage >= 50
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                          : "border-red-500 bg-red-50 dark:bg-red-950"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold">{item.characters.value}</div>
                      <div className="text-xs mt-1">{percentage}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="numbers" className="space-y-4">
            <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
              {numberProgress.map((item) => {
                const total = item.correct + item.incorrect
                const percentage = total > 0 ? Math.round((item.correct / total) * 100) : 0

                return (
                  <div
                    key={item.id}
                    className={`aspect-square flex items-center justify-center rounded-lg border-2 ${
                      percentage >= 80
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : percentage >= 50
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                          : "border-red-500 bg-red-50 dark:bg-red-950"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold">{item.characters.value}</div>
                      <div className="text-xs mt-1">{percentage}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

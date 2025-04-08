"use client"

import { useState, useEffect } from "react"
import { PracticeMode } from "@/components/practice/practice-mode"
import { createClient } from "@/lib/supabase-auth-helpers"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PracticePage({ params }: { params: { childId: string } }) {
  const [childName, setChildName] = useState("")
  const [mode, setMode] = useState<"letters" | "numbers" | "both">("letters")
  const [maxNumber, setMaxNumber] = useState(20)
  const [isConfiguring, setIsConfiguring] = useState(true)
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

  const startPractice = () => {
    setIsConfiguring(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-dot-pattern flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Practice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-2">What would {childName} like to practice?</h2>
              <RadioGroup value={mode} onValueChange={(value) => setMode(value as any)} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="letters" id="letters" className="h-5 w-5" />
                  <Label htmlFor="letters" className="text-lg">
                    Letters (A-Z)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="numbers" id="numbers" className="h-5 w-5" />
                  <Label htmlFor="numbers" className="text-lg">
                    Numbers
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" className="h-5 w-5" />
                  <Label htmlFor="both" className="text-lg">
                    Both Letters & Numbers
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {(mode === "numbers" || mode === "both") && (
              <div>
                <h2 className="text-lg font-bold mb-2">Maximum number to practice:</h2>
                <Input
                  type="number"
                  min="5"
                  max="100"
                  value={maxNumber}
                  onChange={(e) => setMaxNumber(Number.parseInt(e.target.value) || 20)}
                  className="border-2 h-12 text-lg"
                />
              </div>
            )}

            <Button
              onClick={startPractice}
              className="w-full h-12 text-lg font-bold rounded-xl border-2 border-black dark:border-white"
            >
              Start Practice
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <PracticeMode childId={params.childId} childName={childName} mode={mode} maxNumber={maxNumber} />
}

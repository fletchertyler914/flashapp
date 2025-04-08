"use client"

import { createClient } from "@/lib/supabase-auth-helpers"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SeedDataGenerator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const generateSampleData = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("You must be logged in to generate sample data")
      }

      const userId = userData.user.id

      // 1. Create sample children
      const childrenData = [
        { name: "Emma", age: 4 },
        { name: "Noah", age: 5 },
        { name: "Olivia", age: 3 },
      ]

      const { data: childrenResults, error: childrenError } = await supabase
        .from("children")
        .insert(childrenData.map((child) => ({ ...child, parent_id: userId })))
        .select()

      if (childrenError) throw childrenError
      if (!childrenResults || childrenResults.length === 0) {
        throw new Error("Failed to create sample children")
      }

      // 2. Get all characters
      const { data: characters, error: charactersError } = await supabase.from("characters").select("*")

      if (charactersError) throw charactersError
      if (!characters || characters.length === 0) {
        throw new Error("No characters found in the database")
      }

      // 3. Create practice sessions and progress for each child
      for (const child of childrenResults) {
        // Create a practice session
        const { data: sessionData, error: sessionError } = await supabase
          .from("practice_sessions")
          .insert([
            {
              child_id: child.id,
              started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              ended_at: new Date().toISOString(),
              duration: 3600, // 1 hour in seconds
            },
          ])
          .select()

        if (sessionError) throw sessionError
        if (!sessionData || sessionData.length === 0) {
          throw new Error("Failed to create practice session")
        }

        const sessionId = sessionData[0].id

        // Create progress and session results for letters (A-E)
        const letterCharacters = characters.filter((c) => c.type === "letter").slice(0, 5)
        for (const char of letterCharacters) {
          // Randomize results - more correct for higher letters (simulating learning progress)
          const letterIndex = char.value.charCodeAt(0) - 65 // A=0, B=1, etc.
          const correctProbability = 0.5 + letterIndex * 0.1 // 50% for A, 60% for B, etc.
          const totalAttempts = 5 + Math.floor(Math.random() * 5) // 5-9 attempts
          const correctAttempts = Math.floor(totalAttempts * correctProbability)
          const incorrectAttempts = totalAttempts - correctAttempts

          // Add to progress table
          await supabase.from("progress").insert([
            {
              child_id: child.id,
              character_id: char.id,
              correct: correctAttempts,
              incorrect: incorrectAttempts,
              last_practiced: new Date().toISOString(),
            },
          ])

          // Add session results
          for (let i = 0; i < totalAttempts; i++) {
            const isCorrect = i < correctAttempts
            await supabase.from("session_results").insert([
              {
                session_id: sessionId,
                character_id: char.id,
                result: isCorrect,
              },
            ])
          }
        }

        // Create progress and session results for numbers (1-5)
        const numberCharacters = characters.filter((c) => c.type === "number").slice(1, 6) // 1-5
        for (const char of numberCharacters) {
          // Randomize results - more correct for lower numbers (simulating learning progress)
          const numberValue = Number.parseInt(char.value)
          const correctProbability = 0.9 - (numberValue - 1) * 0.1 // 90% for 1, 80% for 2, etc.
          const totalAttempts = 5 + Math.floor(Math.random() * 5) // 5-9 attempts
          const correctAttempts = Math.floor(totalAttempts * correctProbability)
          const incorrectAttempts = totalAttempts - correctAttempts

          // Add to progress table
          await supabase.from("progress").insert([
            {
              child_id: child.id,
              character_id: char.id,
              correct: correctAttempts,
              incorrect: incorrectAttempts,
              last_practiced: new Date().toISOString(),
            },
          ])

          // Add session results
          for (let i = 0; i < totalAttempts; i++) {
            const isCorrect = i < correctAttempts
            await supabase.from("session_results").insert([
              {
                session_id: sessionId,
                character_id: char.id,
                result: isCorrect,
              },
            ])
          }
        }
      }

      setSuccess("Sample data generated successfully!")
    } catch (error: any) {
      console.error("Error generating sample data:", error)
      setError(error.message || "An error occurred while generating sample data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={generateSampleData}
        disabled={loading}
        className="w-full h-12 font-bold rounded-xl border-2 border-black dark:border-white"
      >
        {loading ? "Generating Sample Data..." : "Generate Sample Data"}
      </Button>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>This will create:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>3 sample children (Emma, Noah, Olivia)</li>
          <li>Practice sessions for each child</li>
          <li>Progress data for letters A-E and numbers 1-5</li>
          <li>Session results with varying success rates</li>
        </ul>
      </div>
    </div>
  )
}

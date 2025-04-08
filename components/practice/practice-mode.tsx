"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"
import { Flashcard } from "@/components/flashcard"
import { Check, X, Shuffle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { createPracticeSession, endPracticeSession, recordSessionResult } from "@/app/actions/practice-actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Character = Database["public"]["Tables"]["characters"]["Row"]

interface PracticeModeProps {
  childId: string
  childName: string
  mode: "letters" | "numbers" | "both"
  maxNumber?: number
}

export function PracticeMode({ childId, childName, mode, maxNumber = 20 }: PracticeModeProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const router = useRouter()

  // Fetch characters and start a session
  useEffect(() => {
    const fetchCharactersAndStartSession = async () => {
      try {
        setLoading(true)

        // Fetch characters based on mode
        let query = supabase.from("characters").select("*")

        if (mode === "letters") {
          query = query.eq("type", "letter")
        } else if (mode === "numbers") {
          query = query.eq("type", "number").lte("value", maxNumber.toString())
        } else {
          // Both letters and numbers
          query = query.or(`type.eq.letter,and(type.eq.number,value.lte.${maxNumber})`)
        }

        const { data: charactersData, error: charactersError } = await query.order("id")

        if (charactersError) throw charactersError

        // Start a new practice session using server action
        const result = await createPracticeSession(childId)

        if (!result.success) {
          throw new Error(result.error || "Failed to create practice session")
        }

        setCharacters(charactersData || [])
        setSessionId(result.sessionId)
        setSessionStartTime(new Date())
      } catch (error: any) {
        setError(error.message || "Failed to start practice session")
      } finally {
        setLoading(false)
      }
    }

    fetchCharactersAndStartSession()
  }, [childId, mode, maxNumber])

  // End the session when component unmounts
  useEffect(() => {
    return () => {
      if (sessionId && sessionStartTime) {
        const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)
        endPracticeSession(sessionId, duration)
      }
    }
  }, [sessionId, sessionStartTime])

  const handleResult = async (result: boolean) => {
    if (!sessionId || !characters[currentIndex]) return

    try {
      // Record the result using server action
      const recordResult = await recordSessionResult(sessionId, characters[currentIndex].id, result)

      if (!recordResult.success) {
        throw new Error(recordResult.error || "Failed to record result")
      }

      // Move to next character
      if (currentIndex < characters.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // End of practice
        router.push(`/progress/${childId}`)
      }
    } catch (error: any) {
      setError(error.message || "Failed to record result")
    }
  }

  const handleRandom = () => {
    if (characters.length <= 1) return

    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * characters.length)
    } while (randomIndex === currentIndex)

    setCurrentIndex(randomIndex)
  }

  const handleExit = async () => {
    if (sessionId && sessionStartTime) {
      const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)
      await endPracticeSession(sessionId, duration)
    }
    router.push("/dashboard")
  }

  if (loading) return <div className="text-center py-8">Loading practice session...</div>
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>
  if (characters.length === 0) return <div className="text-center py-8">No characters available for practice.</div>

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setShowExitDialog(true)}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Practice with {childName}</h1>
              <p className="text-sm text-gray-500">
                {currentIndex + 1} of {characters.length} •
                {mode === "letters" ? " Letters" : mode === "numbers" ? " Numbers" : " Mixed"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <Flashcard item={characters[currentIndex]?.value || ""} onClick={() => {}} onPrevious={() => {}} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-16 w-16 border-4 border-red-500 dark:border-red-700 bg-white dark:bg-black hover:bg-red-50 dark:hover:bg-red-950"
            onClick={() => handleResult(false)}
          >
            <X className="h-8 w-8 text-red-500 dark:text-red-400" />
            <span className="sr-only">Incorrect</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-16 w-16 border-4 border-black dark:border-white bg-white dark:bg-black"
            onClick={handleRandom}
          >
            <Shuffle className="h-7 w-7" />
            <span className="sr-only">Random</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-16 w-16 border-4 border-green-500 dark:border-green-700 bg-white dark:bg-black hover:bg-green-50 dark:hover:bg-green-950"
            onClick={() => handleResult(true)}
          >
            <Check className="h-8 w-8 text-green-500 dark:text-green-400" />
            <span className="sr-only">Correct</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Practice Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit this practice session? Your progress so far will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Practice</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>Exit to Dashboard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

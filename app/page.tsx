"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard")
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dot-pattern">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Pre-K Letters and Numbers</h1>
        <p className="text-xl md:text-2xl max-w-md mx-auto">
          Help your child learn letters and numbers with fun flashcards and track their progress
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => router.push("/auth")}
          className="text-lg px-8 py-6 h-auto border-2 border-black dark:border-white"
        >
          Get Started
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/flashcards")}
          className="text-lg px-8 py-6 h-auto border-2 border-black dark:border-white"
        >
          Try Flashcards
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Settings } from "@/components/settings"
import { Flashcard } from "@/components/flashcard"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Shuffle, ArrowLeft } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { useRouter } from "next/navigation"

type Mode = "letters" | "numbers" | "shuffle"
type MaxNumberOption = "10" | "20" | "50" | "100" | "custom"

export default function FlashcardsPage() {
  const isMobile = useMobile()
  const router = useRouter()

  // State for the current mode and max number options
  const [mode, setMode] = useLocalStorage<Mode>("flashcard-mode", "letters")
  const [maxNumberOption, setMaxNumberOption] = useLocalStorage<MaxNumberOption>("flashcard-max-number-option", "20")
  const [customMaxNumber, setCustomMaxNumber] = useLocalStorage<number>("flashcard-custom-max-number", 30)

  // Get the actual max number value
  const getMaxNumber = (): number => {
    if (maxNumberOption === "custom") return customMaxNumber
    return Number.parseInt(maxNumberOption, 10)
  }

  // Generate the sequential items based on the current mode
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  const numbers = Array.from({ length: getMaxNumber() + 1 }, (_, i) => i.toString())

  // Get the sequential items (not shuffled)
  const getSequentialItems = () => {
    if (mode === "letters") return letters
    if (mode === "numbers") return numbers
    return [...letters, ...numbers] // For shuffle mode, combine both
  }

  const [sequentialItems, setSequentialItems] = useState<string[]>(getSequentialItems())
  const [currentIndex, setCurrentIndex] = useState(0)

  // Update items when mode or max number changes
  useEffect(() => {
    const newSequentialItems = getSequentialItems()
    setSequentialItems(newSequentialItems)
    setCurrentIndex(0)
  }, [mode, maxNumberOption, customMaxNumber])

  // Get the current item being displayed
  const currentItem = sequentialItems[currentIndex]

  // Handle advancing to the next sequential item
  const handleNext = () => {
    if (!currentItem) return
    setCurrentIndex((prev) => (prev + 1) % sequentialItems.length)
  }

  // Handle going to the previous sequential item
  const handlePrevious = () => {
    if (!currentItem) return
    setCurrentIndex((prev) => (prev - 1 + sequentialItems.length) % sequentialItems.length)
  }

  // Handle going to a random item (different from current)
  const handleRandom = () => {
    if (sequentialItems.length <= 1) return

    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * sequentialItems.length)
    } while (randomIndex === currentIndex)

    setCurrentIndex(randomIndex)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid scrolling
      if (["ArrowRight", "ArrowLeft", " "].includes(e.key)) {
        e.preventDefault()

        if (e.key === "ArrowRight" || e.key === " ") {
          handleNext()
        } else if (e.key === "ArrowLeft") {
          handlePrevious()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, sequentialItems])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-0 md:p-4 bg-dot-pattern">
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 border-2 border-black dark:border-white"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Home</span>
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Settings
          mode={mode}
          setMode={setMode}
          maxNumberOption={maxNumberOption}
          setMaxNumberOption={setMaxNumberOption}
          customMaxNumber={customMaxNumber}
          setCustomMaxNumber={setCustomMaxNumber}
        />
      </div>

      {isMobile ? (
        // Mobile layout - Full screen card
        <div className="fixed inset-0 flex items-center justify-center">
          <Flashcard item={currentItem || ""} onClick={handleNext} onPrevious={handlePrevious} />

          {/* Shuffle button positioned at the bottom */}
          <div className="absolute bottom-8 z-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-16 w-16 text-2xl border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white dark:bg-black"
              onClick={handleRandom}
            >
              <Shuffle className="h-7 w-7" />
              <span className="sr-only">Random</span>
            </Button>
          </div>
        </div>
      ) : (
        // Desktop layout - Card with navigation buttons
        <>
          <div className="relative w-full max-w-md aspect-square rounded-[2rem] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] bg-white dark:bg-black overflow-hidden">
            <Flashcard item={currentItem || ""} onClick={handleNext} onPrevious={handlePrevious} />
          </div>

          <div className="mt-8 flex gap-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-16 w-16 text-2xl border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white dark:bg-black"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-16 w-16 text-2xl border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white dark:bg-black"
              onClick={handleRandom}
            >
              <Shuffle className="h-7 w-7" />
              <span className="sr-only">Random</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-16 w-16 text-2xl border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white dark:bg-black"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </>
      )}

      <PWAInstallPrompt />
    </main>
  )
}

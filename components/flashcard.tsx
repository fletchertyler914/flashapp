"use client"

import { useState, type TouchEvent } from "react"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

interface FlashcardProps {
  item: string
  onClick: () => void
  onPrevious: () => void
}

export function Flashcard({ item, onClick, onPrevious }: FlashcardProps) {
  const isMobile = useMobile()
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // The minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      onClick() // Next card
    } else if (isRightSwipe) {
      onPrevious() // Previous card
    }
  }

  return (
    <motion.div
      className={`flex items-center justify-center w-full h-full cursor-pointer ${
        isMobile ? "bg-white dark:bg-black" : ""
      }`}
      onClick={isMobile ? undefined : onClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
      key={item}
    >
      <div
        className={`font-bold font-rounded tracking-wider ${
          isMobile ? "text-[40vw]" : "text-[30vw] sm:text-[25vw] md:text-[20vw] lg:text-[15vw]"
        }`}
      >
        {item}
      </div>
    </motion.div>
  )
}

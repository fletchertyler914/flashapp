"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // For non-iOS devices, listen for the beforeinstallprompt event
    if (!isIOSDevice) {
      const handler = (e: Event) => {
        e.preventDefault()
        setInstallPrompt(e as BeforeInstallPromptEvent)
        setIsInstallable(true)
      }

      window.addEventListener("beforeinstallprompt", handler)
      return () => window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    // Show the install prompt
    await installPrompt.prompt()

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice

    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }

    // Reset the installPrompt
    setInstallPrompt(null)
    setIsInstallable(false)
  }

  // Don't show anything if not installable and not iOS
  if (!isInstallable && !isIOS) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center">
      {isInstallable ? (
        <Button
          onClick={handleInstallClick}
          className="flex items-center gap-2 rounded-full px-4 py-2 bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
        >
          <Download className="h-5 w-5" />
          <span>Install App</span>
        </Button>
      ) : isIOS ? (
        <div className="bg-white dark:bg-black p-3 rounded-lg border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] text-center max-w-xs">
          <p>Install this app on your device:</p>
          <p className="text-sm mt-1">
            Tap{" "}
            <span className="inline-block">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="inline"
              >
                <path
                  d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5 20 9.09 19.649 7.85 19.027L3 20L4.2 16.252C3.434 14.966 3 13.522 3 12C3 7.582 7.03 4 12 4C16.97 4 21 7.582 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{" "}
            then "Add to Home Screen"
          </p>
        </div>
      ) : null}
    </div>
  )
}

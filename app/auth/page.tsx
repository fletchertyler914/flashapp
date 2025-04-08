"use client"

import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createClient } from "@/lib/supabase-auth-helpers"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()
  const { theme } = useTheme()
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_in")
  const [mounted, setMounted] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState("")

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)
    // Set the redirect URL only on the client side
    setRedirectUrl(`${window.location.origin}/dashboard`)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, mounted])

  // Don't render anything until client-side
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-dot-pattern">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Account Access</CardTitle>
            <CardDescription>Loading authentication...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center">
              <div className="animate-pulse">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dot-pattern">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Account Access</CardTitle>
          <CardDescription>Sign in or create an account to track your child's progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "black",
                    brandAccent: "darkgray",
                    inputBackground: theme === "dark" ? "#333" : "white",
                    inputText: theme === "dark" ? "white" : "black",
                    inputPlaceholder: theme === "dark" ? "#aaa" : "#666",
                  },
                },
              },
              className: {
                button: "w-full h-12 text-lg font-bold rounded-xl border-2 border-black dark:border-white",
                input: "border-2 h-12",
                label: "text-foreground",
                anchor: "text-foreground hover:text-foreground/80",
              },
              style: {
                input: {
                  color: theme === "dark" ? "white" : "black",
                  backgroundColor: theme === "dark" ? "#333" : "white",
                },
                password: {
                  color: theme === "dark" ? "white" : "black",
                  backgroundColor: theme === "dark" ? "#333" : "white",
                },
              },
            }}
            providers={[]}
            redirectTo={redirectUrl}
            onViewChange={(newView) => {
              // @ts-ignore - the types are incorrect in the library
              setView(newView)
            }}
            afterSignUpView="sign_in"
          />
        </CardContent>
      </Card>
    </div>
  )
}

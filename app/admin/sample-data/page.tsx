"use client"

import { useEffect, useState } from "react"
import { SeedDataGenerator } from "@/utils/seed-data.tsx"
import { createClient } from "@/lib/supabase-auth-helpers"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SampleDataPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/auth")
        return
      }

      // Check if user is admin
      const { data: parentData, error } = await supabase
        .from("parents")
        .select("is_admin")
        .eq("id", data.session.user.id)
        .single()

      if (error || !parentData || !parentData.is_admin) {
        // Not an admin, redirect to dashboard
        router.push("/dashboard")
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Extra safety check
  if (!isAdmin) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="min-h-screen bg-dot-pattern">
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Sample Data Generator</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Generate Sample Data</CardTitle>
          </CardHeader>
          <CardContent>
            <SeedDataGenerator />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

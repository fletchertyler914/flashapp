"use client"

import { useEffect, useState } from "react"
import { ChildForm } from "@/components/dashboard/child-form"
import { ChildList } from "@/components/dashboard/child-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-auth-helpers"
import { useRouter } from "next/navigation"
import { LogOut, Database, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAddChildForm, setShowAddChildForm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/auth")
        return
      }

      setUser(data.session.user)

      // Check if user is admin
      const { data: parentData, error } = await supabase
        .from("parents")
        .select("is_admin")
        .eq("id", data.session.user.id)
        .single()

      if (!error && parentData) {
        setIsAdmin(parentData.is_admin || false)
      }

      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  // Add auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth")
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user)

        // Check admin status when signed in
        const checkAdminStatus = async () => {
          const { data: parentData, error } = await supabase
            .from("parents")
            .select("is_admin")
            .eq("id", session.user.id)
            .single()

          if (!error && parentData) {
            setIsAdmin(parentData.is_admin || false)
          }
        }

        checkAdminStatus()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshChildren = () => {
    setRefreshKey((prev) => prev + 1)
    setShowAddChildForm(false) // Hide form after successful add
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-dot-pattern">
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Parent Dashboard</h1>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => router.push("/admin/sample-data")} className="gap-2">
                <Database className="h-4 w-4" /> Sample Data
              </Button>
            )}
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-5 w-5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {user && <DashboardStats parentId={user.id} />}

        <div className="relative">
          <ChildList key={refreshKey} />

          {!showAddChildForm ? (
            <div className="mt-6 flex justify-center">
              <Button onClick={() => setShowAddChildForm(true)} className="rounded-full h-14 w-14 p-0 shadow-lg">
                <Plus className="h-6 w-6" />
                <span className="sr-only">Add Child</span>
              </Button>
            </div>
          ) : (
            <Card className="mt-6 max-w-md mx-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Add Child</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddChildForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>{user && <ChildForm onSuccess={refreshChildren} parentId={user.id} />}</CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

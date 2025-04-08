"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase-auth-helpers"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ChildFormProps {
  onSuccess: () => void
  parentId: string
}

export function ChildForm({ onSuccess, parentId }: ChildFormProps) {
  const [name, setName] = useState("")
  const [age, setAge] = useState<number | "">("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Add the child - parent record is now created automatically by the database trigger
      const { error } = await supabase.from("children").insert([
        {
          name,
          age: age === "" ? null : age,
          parent_id: parentId,
        },
      ])

      if (error) throw error

      setName("")
      setAge("")
      setSuccess(`${name} has been added successfully.`)
      onSuccess()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="border-2 h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age (optional)</Label>
          <Input
            id="age"
            type="number"
            min="1"
            max="10"
            value={age}
            onChange={(e) => setAge(e.target.value ? Number.parseInt(e.target.value) : "")}
            className="border-2 h-12"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-bold rounded-xl border-2 border-black dark:border-white"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Child"}
        </Button>
      </form>
    </div>
  )
}

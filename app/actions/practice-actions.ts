"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { revalidatePath } from "next/cache"

export async function createPracticeSession(childId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Verify the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error("Not authenticated")
    }

    // Verify the child belongs to the current user
    const { data: childData, error: childError } = await supabase
      .from("children")
      .select("id")
      .eq("id", childId)
      .eq("parent_id", session.user.id)
      .single()

    if (childError || !childData) {
      throw new Error("Child not found or not authorized")
    }

    // Create the practice session
    const { data, error } = await supabase
      .from("practice_sessions")
      .insert([{ child_id: childId }])
      .select()

    if (error) throw error

    revalidatePath(`/practice/${childId}`)
    return { success: true, sessionId: data[0].id }
  } catch (error: any) {
    console.error("Error creating practice session:", error)
    return { success: false, error: error.message }
  }
}

export async function endPracticeSession(sessionId: string, duration: number) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Update the session with end time and duration
    const now = new Date()
    const { error } = await supabase
      .from("practice_sessions")
      .update({
        ended_at: now.toISOString(),
        duration: duration,
      })
      .eq("id", sessionId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error ending practice session:", error)
    return { success: false, error: error.message }
  }
}

export async function recordSessionResult(sessionId: string, characterId: number, result: boolean) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Record the session result
    const { error: resultError } = await supabase.from("session_results").insert([
      {
        session_id: sessionId,
        character_id: characterId,
        result,
      },
    ])

    if (resultError) throw resultError

    // Get the child_id from the session
    const { data: sessionData, error: sessionError } = await supabase
      .from("practice_sessions")
      .select("child_id")
      .eq("id", sessionId)
      .single()

    if (sessionError || !sessionData) throw new Error("Session not found")

    // Update or create progress record
    const { data: existingProgress, error: progressQueryError } = await supabase
      .from("progress")
      .select("*")
      .eq("child_id", sessionData.child_id)
      .eq("character_id", characterId)
      .single()

    if (progressQueryError && progressQueryError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned" which is expected if no progress exists yet
      throw progressQueryError
    }

    if (existingProgress) {
      // Update existing progress
      const { error: updateError } = await supabase
        .from("progress")
        .update({
          [result ? "correct" : "incorrect"]: result ? existingProgress.correct + 1 : existingProgress.incorrect + 1,
          last_practiced: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id)

      if (updateError) throw updateError
    } else {
      // Create new progress record
      const { error: insertError } = await supabase.from("progress").insert([
        {
          child_id: sessionData.child_id,
          character_id: characterId,
          correct: result ? 1 : 0,
          incorrect: result ? 0 : 1,
          last_practiced: new Date().toISOString(),
        },
      ])

      if (insertError) throw insertError
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error recording session result:", error)
    return { success: false, error: error.message }
  }
}

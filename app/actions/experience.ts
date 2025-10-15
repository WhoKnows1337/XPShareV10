'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteExperience(experienceId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check ownership
  const { data: experience } = await supabase
    .from('experiences')
    .select('user_id')
    .eq('id', experienceId)
    .single()

  if (!experience || experience.user_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  // Delete experience (cascade will handle related data)
  const { error } = await supabase.from('experiences').delete().eq('id', experienceId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate user profile and feed
  revalidatePath(`/@${user.id}`)
  revalidatePath('/feed')

  return { success: true }
}

export async function exportExperiencePDF(experienceId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Fetch full experience data
  const { data: experience, error } = await supabase
    .from('experiences')
    .select(
      `
      *,
      user_profiles!experiences_user_id_fkey (
        username,
        display_name
      ),
      experience_answers (
        answer_value,
        dynamic_questions (
          question_text,
          question_type
        )
      ),
      experience_media (
        type,
        url,
        caption
      ),
      experience_witnesses (
        name,
        testimony
      )
    `
    )
    .eq('id', experienceId)
    .single()

  if (error || !experience) {
    return { success: false, error: 'Experience not found' }
  }

  // Check permissions (author or public)
  if (experience.visibility === 'private' && experience.user_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  // Generate PDF data (simple JSON for now, can be extended with actual PDF generation)
  const userProfiles = experience.user_profiles as any
  const experienceAnswers = experience.experience_answers as any
  const experienceMedia = experience.experience_media as any
  const experienceWitnesses = experience.experience_witnesses as any

  const pdfData = {
    title: experience.title,
    author: userProfiles?.display_name || userProfiles?.username,
    category: experience.category,
    dateOccurred: experience.date_occurred,
    location: experience.location_text,
    story: experience.story_text,
    tags: experience.tags,
    answers: experienceAnswers?.map((a: any) => ({
      question: a.dynamic_questions.question_text,
      answer: a.answer_value,
    })),
    media: experienceMedia?.map((m: any) => ({
      type: m.type,
      url: m.url,
      caption: m.caption,
    })),
    witnesses: experienceWitnesses?.map((w: any) => ({
      name: w.name,
      testimony: w.testimony,
    })),
  }

  return { success: true, data: pdfData }
}

export async function linkExperiences(sourceId: string, targetId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if source experience belongs to user
  const { data: sourceExp } = await supabase
    .from('experiences')
    .select('user_id')
    .eq('id', sourceId)
    .single()

  if (!sourceExp || sourceExp.user_id !== user.id) {
    return { success: false, error: 'Not authorized to link this experience' }
  }

  // Check if target experience exists and is public
  const { data: targetExp } = await supabase
    .from('experiences')
    .select('id, visibility')
    .eq('id', targetId)
    .single()

  if (!targetExp || targetExp.visibility === 'private') {
    return { success: false, error: 'Target experience not found or not public' }
  }

  // Create link
  const { error } = await supabase.from('experience_links').insert({
    source_experience_id: sourceId,
    linked_experience_id: targetId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate experience page
  revalidatePath(`/experiences/${sourceId}`)

  return { success: true }
}

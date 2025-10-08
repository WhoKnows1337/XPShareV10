import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExperienceWizard } from '@/components/submission/experience-wizard'

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const supabase = await createClient()
  const { id, locale } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/experiences/${id}/edit`)
  }

  // Fetch experience
  const { data: experience } = await supabase
    .from('experiences')
    .select(`
      *,
      experience_answers (
        id,
        answer_value,
        dynamic_questions (
          id,
          question_text,
          question_type,
          options
        )
      ),
      experience_media (
        id,
        type,
        url,
        caption,
        sort_order
      ),
      experience_witnesses (
        id,
        name,
        testimony,
        is_verified
      )
    `)
    .eq('id', id)
    .single()

  if (!experience) {
    redirect(`/${locale}/experiences/${id}`)
  }

  // Check permissions
  if (experience.user_id !== user.id) {
    redirect(`/${locale}/experiences/${id}`)
  }

  // Transform data for wizard
  const initialData = {
    title: experience.title,
    storyText: experience.story_text || '',
    category: experience.category,
    tags: experience.tags || [],
    locationText: experience.location_text || '',
    locationLat: experience.location_lat,
    locationLng: experience.location_lng,
    dateOccurred: experience.date_occurred || '',
    timeOfDay: experience.time_of_day || '',
    heroImage: experience.hero_image_url || '',
    visibility: experience.visibility,
    dynamicAnswers: (experience.experience_answers || []).map((answer: any) => ({
      questionId: answer.dynamic_questions.id,
      questionText: answer.dynamic_questions.question_text,
      questionType: answer.dynamic_questions.question_type,
      answerValue: answer.answer_value,
      options: answer.dynamic_questions.options,
    })),
    media: (experience.experience_media || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((item: any) => ({
        id: item.id,
        type: item.type,
        url: item.url,
        caption: item.caption,
      })),
    witnesses: (experience.experience_witnesses || []).map((w: any) => ({
      id: w.id,
      name: w.name,
      testimony: w.testimony,
      isVerified: w.is_verified,
    })),
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Experience</h1>
        <p className="text-muted-foreground mt-2">
          Update your experience details
        </p>
      </div>

      <ExperienceWizard mode="edit" experienceId={id} initialData={initialData} />
    </div>
  )
}

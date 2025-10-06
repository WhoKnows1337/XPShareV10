'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface SimilarExperiencesProps {
  text: string
  category: string
  tags: string[]
  currentExperienceId?: string
}

export function SimilarExperiences({
  text,
  category,
  tags,
  currentExperienceId,
}: SimilarExperiencesProps) {
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const response = await fetch('/api/patterns/similar-experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            category,
            tags,
            experienceId: currentExperienceId,
            limit: 3,
          }),
        })

        const data = await response.json()
        setExperiences(data.experiences || [])
      } catch (error) {
        console.error('Failed to fetch similar experiences:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilar()
  }, [text, category, tags, currentExperienceId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Finding Similar Experiences...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-200" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (experiences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Pattern Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No similar experiences found yet. Your experience might be unique!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          Similar Experiences ({experiences.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Other people have shared similar experiences
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {experiences.map((exp: any) => (
          <Link
            key={exp.id}
            href={`/experiences/${exp.id}`}
            className="block group"
          >
            <div className="rounded-lg border p-4 transition-all hover:border-purple-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold line-clamp-1 group-hover:text-purple-600">
                  {exp.title}
                </h4>
                {exp.similarity_score && (
                  <Badge variant="secondary" className="shrink-0">
                    {Math.round((exp.similarity_score / 5) * 100)}% match
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {exp.story_text}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {exp.tags?.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Link>
        ))}

        {experiences.length >= 3 && (
          <div className="rounded-lg bg-purple-50 p-4 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">
              You're part of a pattern!
            </p>
            <p className="text-xs text-purple-700">
              {experiences.length} similar experiences have been shared
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

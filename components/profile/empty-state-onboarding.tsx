'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, Users, Award } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateOnboardingProps {
  type: 'experiences' | 'connections' | 'badges'
}

export function EmptyStateOnboarding({ type }: EmptyStateOnboardingProps) {
  const states = {
    experiences: {
      icon: <BookOpen className="h-16 w-16 text-purple-500" />,
      title: 'Your XP Journey Starts Here',
      description: 'Share your first extraordinary experience and start connecting with others who\'ve had similar moments.',
      primaryAction: {
        label: 'Share Your First XP',
        href: '/submit',
        icon: <Plus className="mr-2 h-4 w-4" />,
      },
      secondaryActions: [
        { label: 'Explore Examples', href: '/feed' },
      ],
    },
    connections: {
      icon: <Users className="h-16 w-16 text-blue-500" />,
      title: 'Find Your XP Twins',
      description: 'You haven\'t connected with anyone yet. Share experiences to find users with similar stories.',
      primaryAction: {
        label: 'Share an Experience',
        href: '/submit',
        icon: <Plus className="mr-2 h-4 w-4" />,
      },
      secondaryActions: [
        { label: 'Browse Community', href: '/feed' },
      ],
      quote: '"Every connection starts with a shared moment."',
    },
    badges: {
      icon: <Award className="h-16 w-16 text-amber-500" />,
      title: 'Start Earning Badges',
      description: 'Complete actions to unlock achievements and climb the leaderboard.',
      primaryAction: {
        label: 'View All Badges',
        href: '/badges',
        icon: <Award className="mr-2 h-4 w-4" />,
      },
      nextSteps: [
        { action: 'Share your first experience', xp: 50, badge: 'First Steps' },
        { action: 'Get 5 pattern confirmations', xp: 100, badge: 'Pattern Hunter' },
      ],
    },
  }

  const state = states[type]

  return (
    <Card className="border-dashed border-2">
      <CardContent className="py-12 text-center space-y-6">
        <div className="flex justify-center">
          {state.icon}
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-2xl font-bold">{state.title}</h3>
          <p className="text-muted-foreground">{state.description}</p>
        </div>

        {'quote' in state && state.quote && (
          <blockquote className="italic text-sm text-muted-foreground">
            {state.quote}
          </blockquote>
        )}

        {'nextSteps' in state && state.nextSteps && (
          <div className="space-y-2 max-w-sm mx-auto">
            <h4 className="font-semibold">Next Steps:</h4>
            {state.nextSteps.map((step, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">{step.action}</span>
                <Badge variant="secondary">+{step.xp} XP</Badge>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={state.primaryAction.href}>
            <Button size="lg" className="w-full sm:w-auto">
              {state.primaryAction.icon}
              {state.primaryAction.label}
            </Button>
          </Link>

          {'secondaryActions' in state && state.secondaryActions?.map((action, i) => (
            <Link key={i} href={action.href}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

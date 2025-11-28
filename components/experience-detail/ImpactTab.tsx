'use client';

import { Sparkles, Users, Lightbulb, TrendingUp, Plus, MessageSquare, Edit, Award, Search, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * ImpactTab - Phase 2, Task 2.3 + Phase 5 (Smart Next Steps)
 *
 * Shows user's contribution score, XP twins, and smart next steps.
 * This is a new tab in the BentoTabs experience detail layout.
 *
 * @see docs/maindocs/xpresultsv2/04-components-spec.md - Section 10
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 2, Task 2.3, Phase 5, Task 5.1
 */

interface ImpactTabProps {
  experienceId: string;
  userId?: string;
}

interface ContributionScore {
  overall: number;
  novelty: number;
  patternContribution: number;
  communityValue: number;
  level: 'low' | 'moderate' | 'high' | 'exceptional';
  calculatedAt: string;
}

interface XPTwin {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  matchScore: number;
  sharedExperiences: number;
  sharedCategories: string[];
}

interface NextStep {
  id: string;
  type: 'explore' | 'connect' | 'contribute' | 'research';
  title: string;
  description: string;
  cta_label: string;
  cta_action: string;
  priority: number;
  icon: string;
}

interface SmartNextStepsResponse {
  nextSteps: NextStep[];
  meta: {
    user_total_experiences: number;
    similar_count: number;
    comment_count: number;
    badge_progress_count: number;
  };
}

export function ImpactTab({ experienceId, userId }: ImpactTabProps) {
  // ✅ PHASE 5: Real API integration
  const { data: contributionData, isLoading: contributionLoading } = useQuery<ContributionScore>({
    queryKey: ['contribution', experienceId],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${experienceId}/contribution`);
      if (!res.ok) throw new Error('Failed to fetch contribution data');
      return res.json();
    },
  });

  const { data: xpTwinsData, isLoading: twinsLoading } = useQuery<{ xpTwins: XPTwin[] }>({
    queryKey: ['xp-twins', experienceId],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${experienceId}/xp-twins`);
      if (!res.ok) throw new Error('Failed to fetch XP twins');
      return res.json();
    },
  });

  // ✅ PHASE 5: Smart Next Steps API integration
  const { data: nextStepsData, isLoading: nextStepsLoading } = useQuery<SmartNextStepsResponse>({
    queryKey: ['smart-next-steps', experienceId],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${experienceId}/smart-next-steps`);
      if (!res.ok) throw new Error('Failed to fetch smart next steps');
      return res.json();
    },
  });

  const contributionScore = contributionData || {
    overall: 50,
    novelty: 50,
    patternContribution: 50,
    communityValue: 50,
    level: 'moderate' as const,
    calculatedAt: new Date().toISOString(),
  };

  const xpTwins = xpTwinsData?.xpTwins || [];
  const nextSteps = nextStepsData?.nextSteps || [];

  // Map icon names from algorithm to Lucide icons
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Plus: <Plus className="h-4 w-4" />,
      TrendingUp: <TrendingUp className="h-4 w-4" />,
      MessageSquare: <MessageSquare className="h-4 w-4" />,
      Edit: <Edit className="h-4 w-4" />,
      Award: <Award className="h-4 w-4" />,
      Search: <Search className="h-4 w-4" />,
      Users: <Users className="h-4 w-4" />,
      Sparkles: <Sparkles className="h-4 w-4" />,
      UserPlus: <UserPlus className="h-4 w-4" />,
      Lightbulb: <Lightbulb className="h-4 w-4" />,
    };
    return iconMap[iconName] || <Lightbulb className="h-4 w-4" />;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'moderate':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'high':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'exceptional':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getExplanation = (level: string, novelty: number) => {
    if (level === 'exceptional') {
      return 'Your experience is highly unique and provides exceptional value to the community. It reveals new patterns and insights.';
    }
    if (level === 'high') {
      return 'Your experience adds significant value to emerging patterns. It helps validate and strengthen community knowledge.';
    }
    if (level === 'moderate') {
      return 'Your experience adds valuable context to existing patterns. It contributes to our collective understanding.';
    }
    return 'Your experience is part of a well-documented pattern. Consider adding unique details to increase impact.';
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Contribution Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Your Contribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {contributionLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : (
            <>
              {/* Overall Score */}
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-foreground">
                  {contributionScore.overall}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm text-muted-foreground">Overall Impact Score</p>
                  <Badge variant="outline" className={getLevelColor(contributionScore.level)}>
                    {contributionScore.level}
                  </Badge>
                </div>
                <Progress value={contributionScore.overall} className="h-2 mt-4" />
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Novelty</span>
                    <span className="text-sm text-muted-foreground">
                      {contributionScore.novelty}%
                    </span>
                  </div>
                  <Progress value={contributionScore.novelty} className="h-1.5" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pattern Value</span>
                    <span className="text-sm text-muted-foreground">
                      {contributionScore.patternContribution}%
                    </span>
                  </div>
                  <Progress value={contributionScore.patternContribution} className="h-1.5" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Community</span>
                    <span className="text-sm text-muted-foreground">
                      {contributionScore.communityValue}%
                    </span>
                  </div>
                  <Progress value={contributionScore.communityValue} className="h-1.5" />
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  {getExplanation(contributionScore.level, contributionScore.novelty)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 2: XP Twins */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Your XP Twins</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            People with similar experience patterns
          </p>
        </CardHeader>
        <CardContent>
          {twinsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : xpTwins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {xpTwins.slice(0, 4).map((twin) => (
                <Card key={twin.id} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={twin.avatarUrl} />
                        <AvatarFallback>
                          {(twin.displayName || twin.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{twin.displayName || twin.username}</p>
                            <p className="text-xs text-muted-foreground">@{twin.username}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {twin.matchScore}% match
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{twin.sharedExperiences} shared categories</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {twin.sharedCategories.slice(0, 3).map((category) => (
                            <Badge
                              key={category}
                              variant="outline"
                              className="text-xs px-2 py-0"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No XP twins found yet</p>
              <p className="text-xs">Share more experiences to find similar users</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Smart Next Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Smart Next Steps</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized suggestions to maximize your impact
          </p>
        </CardHeader>
        <CardContent>
          {nextStepsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : nextSteps.length > 0 ? (
            <div className="space-y-4">
              {nextSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getIconComponent(step.icon)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <a href={step.cta_action}>
                      {step.cta_label}
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions available</p>
              <p className="text-xs">Check back after adding more experiences</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

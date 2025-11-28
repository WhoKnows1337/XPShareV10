/**
 * Smart Next Steps Algorithm - Phase 5, Task 5.1
 *
 * Generates personalized next steps based on:
 * - User experience count
 * - Similar experience count
 * - Comment activity
 * - Badge progress
 * - Contribution score
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 5, Task 5.1
 */

export interface User {
  id: string;
  total_experiences: number;
  level: number;
  total_xp: number;
}

export interface Experience {
  id: string;
  title: string;
  category: string;
  comment_count: number;
}

export interface ImpactData {
  similar_count?: number;
  contribution_score?: {
    overall: number;
    novelty: number;
    level: 'low' | 'moderate' | 'high' | 'exceptional';
  };
}

export interface BadgeProgress {
  badge_id: string;
  name: string;
  slug: string;
  description: string;
  progress: number; // 0-1
  remaining: number; // How many more needed
  icon_name?: string;
}

export interface NextStep {
  id: string;
  type: 'explore' | 'connect' | 'contribute' | 'research';
  title: string;
  description: string;
  cta_label: string;
  cta_action: string; // URL or action
  priority: number;
  icon: string;
}

/**
 * Generate smart next steps based on user state and experience data
 */
export function generateSmartNextSteps(
  user: User,
  experience: Experience,
  impactData: ImpactData,
  badgeProgress?: BadgeProgress[]
): NextStep[] {
  const steps: NextStep[] = [];

  // === 1. NEW USER: Encourage more submissions ===
  if (user.total_experiences < 5) {
    steps.push({
      id: 'share-another',
      type: 'contribute',
      title: 'Share another experience',
      description: `You've shared ${user.total_experiences} experience${user.total_experiences !== 1 ? 's' : ''}. The more you share, the better pattern matching becomes`,
      cta_label: 'Submit Experience',
      cta_action: '/submit',
      priority: 1,
      icon: 'Plus',
    });
  }

  // === 2. HIGH SIMILAR COUNT: Explore patterns ===
  if (impactData.similar_count && impactData.similar_count > 10) {
    steps.push({
      id: 'explore-patterns',
      type: 'explore',
      title: 'Explore similar patterns',
      description: `${impactData.similar_count} experiences match yours - discover connections and insights`,
      cta_label: 'View Patterns',
      cta_action: `#patterns-tab`,
      priority: 2,
      icon: 'TrendingUp',
    });
  }

  // === 3. NO COMMENTS: Start conversation ===
  if (experience.comment_count === 0) {
    steps.push({
      id: 'start-conversation',
      type: 'connect',
      title: 'Start a conversation',
      description: 'Share your thoughts or ask questions in the comments',
      cta_label: 'Leave Comment',
      cta_action: '#comments-section',
      priority: 3,
      icon: 'MessageSquare',
    });
  }

  // === 4. LOW NOVELTY: Add more details ===
  if (
    impactData.contribution_score &&
    impactData.contribution_score.novelty < 40
  ) {
    steps.push({
      id: 'add-details',
      type: 'contribute',
      title: 'Add unique details',
      description: 'Your experience matches existing patterns. Add more specific details to increase novelty',
      cta_label: 'Edit Experience',
      cta_action: `/experiences/${experience.id}/edit`,
      priority: 4,
      icon: 'Edit',
    });
  }

  // === 5. BADGE PROGRESS: Unlock badges ===
  if (badgeProgress && badgeProgress.length > 0) {
    // Find badges that are >50% complete
    const nearCompleteBadges = badgeProgress
      .filter((badge) => badge.progress >= 0.5 && badge.progress < 1.0)
      .sort((a, b) => b.progress - a.progress);

    if (nearCompleteBadges.length > 0) {
      const badge = nearCompleteBadges[0];
      steps.push({
        id: `unlock-badge-${badge.badge_id}`,
        type: 'contribute',
        title: `Unlock ${badge.name} badge`,
        description: `${badge.remaining} more ${badge.remaining === 1 ? 'experience' : 'experiences'} needed to earn this badge`,
        cta_label: 'View Progress',
        cta_action: '/profile/badges',
        priority: 5,
        icon: 'Award',
      });
    }
  }

  // === 6. HIGH CONTRIBUTION: Research similar ===
  if (
    impactData.contribution_score &&
    impactData.contribution_score.level === 'exceptional'
  ) {
    steps.push({
      id: 'research-similar',
      type: 'research',
      title: 'Your experience is unique!',
      description: 'Consider researching if others have reported similar events',
      cta_label: 'Search Similar',
      cta_action: `/search?category=${experience.category}`,
      priority: 6,
      icon: 'Search',
    });
  }

  // === 7. MID-LEVEL USER: Connect with XP Twins ===
  if (user.total_experiences >= 5 && user.total_experiences < 20) {
    steps.push({
      id: 'find-xp-twins',
      type: 'connect',
      title: 'Find your XP Twins',
      description: 'Discover users with similar experience patterns',
      cta_label: 'View XP Twins',
      cta_action: '#impact-tab',
      priority: 7,
      icon: 'Users',
    });
  }

  // === 8. HIGH ENGAGEMENT: Explore community ===
  if (experience.comment_count > 5) {
    steps.push({
      id: 'explore-community',
      type: 'explore',
      title: 'Explore community discussions',
      description: 'Your experience sparked great conversation. Check out other popular discussions',
      cta_label: 'Browse Feed',
      cta_action: '/feed',
      priority: 8,
      icon: 'Sparkles',
    });
  }

  // Sort by priority (lower number = higher priority) and return top 3
  return steps.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

/**
 * Check badge progress for a user
 * This would typically query the database
 */
export async function checkBadgeProgress(
  userId: string
): Promise<BadgeProgress[]> {
  // This is a placeholder - actual implementation would query database
  // For now, return empty array (will be implemented in API route)
  return [];
}

# Implementation Roadmap

## 🎯 Overview

This document provides a complete, step-by-step implementation guide for the XPShare Post V2 redesign. Each phase includes specific tasks, file paths, database changes, API requirements, and testing checklists.

**Estimated Timeline:** 6-8 weeks
**Approach:** Incremental delivery with backward compatibility

---

## 📋 Phase Summary

```
PHASE 1: Critical Fixes (Week 1)
└─ Fix hardcoded values, add loading modal, query param handling

PHASE 2: New Core Components (Week 2)
└─ ValidationScoreCard, enhanced PatternContextCard, ImpactTab

PHASE 3: Match Explanations (Week 3)
└─ Smart match reasons, text highlighting, inline insights

PHASE 4: Advanced Analytics (Week 4-5)
└─ Geographic heatmap, timeline charts, correlation matrix

PHASE 5: Community Features (Week 5-6)
└─ XP Twins, Smart Next Steps, enhanced comments

PHASE 6: Polish & Optimization (Week 7-8)
└─ Animations, performance, accessibility, testing
```

---

## 🚀 PHASE 1: Critical Fixes (Week 1)

**Goal:** Fix immediate issues, establish foundation for new features

### Tasks

#### 1.1 Fix JustPublishedBanner Hardcoded Values

**Problem:** `app/[locale]/experiences/[id]/page.tsx:754-758` has hardcoded XP values

**Files to Modify:**
- `app/[locale]/experiences/[id]/page.tsx`
- `components/experience-detail/JustPublishedBanner.tsx`

**Implementation:**

```typescript
// app/[locale]/experiences/[id]/page.tsx

// Add query param parsing
const searchParams = await params.searchParams;
const justPublished = searchParams?.justPublished === 'true';
const publishResultParams = justPublished ? {
  xpEarned: Number(searchParams.xp) || 0,
  badgesEarned: searchParams.badges ? JSON.parse(searchParams.badges) : [],
  leveledUp: searchParams.levelUp === 'true',
  oldLevel: Number(searchParams.oldLevel),
  newLevel: Number(searchParams.newLevel)
} : null;

// OR: Fetch from session storage
const publishResultFromStorage = justPublished
  ? JSON.parse(sessionStorage.getItem('lastPublishResult') || 'null')
  : null;

const publishResult = publishResultParams || publishResultFromStorage;

// Pass to banner
{justPublished && publishResult && (
  <JustPublishedBanner
    publishResult={publishResult}
    onDismiss={() => {
      sessionStorage.setItem(`banner-dismissed-${experience.id}`, 'true');
      // Optionally remove from URL
      router.replace(`/experiences/${experience.id}`, { scroll: false });
    }}
    isDismissed={false}
  />
)}
```

**Update redirect in FilesWitnessesScreen.tsx:**

```typescript
// components/submit-observatory/screen4/FilesWitnessesScreen.tsx:263-269

// Store in session storage for page refresh
sessionStorage.setItem('lastPublishResult', JSON.stringify(result));

// Encode in URL
const params = new URLSearchParams({
  justPublished: 'true',
  xp: result.xpEarned.toString(),
  badges: JSON.stringify(result.badgesEarned),
  levelUp: result.leveledUp.toString(),
  oldLevel: result.oldLevel?.toString() || '',
  newLevel: result.newLevel?.toString() || ''
});

const successUrl = `/${locale}/experiences/${result.experienceId}?${params.toString()}`;
window.location.href = successUrl;
```

**Testing:**
- [ ] Publish experience and verify real XP shown
- [ ] Verify badges displayed correctly
- [ ] Verify level-up animation triggers
- [ ] Test page refresh (should still show banner)
- [ ] Test dismissal persistence

---

#### 1.2 Create DiscoveryLoadingModal

**Purpose:** Show pattern discovery progress during publish API call

**New File:** `components/experience-detail/DiscoveryLoadingModal.tsx`

**Implementation:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles, Search, TrendingUp, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'complete';
  icon: React.ReactNode;
  duration: number;
}

interface DiscoveryLoadingModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

const defaultSteps: LoadingStep[] = [
  { id: 'analyzing', label: 'Analyzing your experience...', status: 'pending', icon: <Sparkles />, duration: 1000 },
  { id: 'matching', label: 'Finding similar experiences...', status: 'pending', icon: <Search />, duration: 1500 },
  { id: 'patterns', label: 'Detecting patterns...', status: 'pending', icon: <TrendingUp />, duration: 1000 },
  { id: 'complete', label: 'Done!', status: 'pending', icon: <Check />, duration: 500 }
];

export function DiscoveryLoadingModal({ isOpen, onComplete }: DiscoveryLoadingModalProps) {
  const [steps, setSteps] = useState(defaultSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      setSteps(defaultSteps);
      setCurrentStepIndex(0);
      setProgress(0);
      return;
    }

    const progressStep = () => {
      if (currentStepIndex >= steps.length) {
        // All steps complete
        setTimeout(() => {
          onComplete?.();
        }, 500);
        return;
      }

      const currentStep = steps[currentStepIndex];

      // Mark current step as loading
      setSteps(prev =>
        prev.map((step, idx) =>
          idx === currentStepIndex ? { ...step, status: 'loading' as const } : step
        )
      );

      // Complete step after duration
      setTimeout(() => {
        setSteps(prev =>
          prev.map((step, idx) =>
            idx === currentStepIndex ? { ...step, status: 'complete' as const } : step
          )
        );

        const newProgress = ((currentStepIndex + 1) / steps.length) * 100;
        setProgress(newProgress);

        // Move to next step
        setCurrentStepIndex(prev => prev + 1);
      }, currentStep.duration);
    };

    progressStep();
  }, [currentStepIndex, isOpen]);

  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-md" hideClose>
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          {/* Animated Icon */}
          <motion.div
            key={steps[currentStepIndex]?.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="text-primary"
          >
            {steps[currentStepIndex]?.icon && (
              <div className="h-16 w-16">
                {steps[currentStepIndex].icon}
              </div>
            )}
          </motion.div>

          {/* Current Step Label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={steps[currentStepIndex]?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-lg font-medium"
            >
              {steps[currentStepIndex]?.label}
            </motion.p>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>

          {/* Steps List */}
          <div className="w-full space-y-2">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    step.status === 'complete' && 'bg-green-500',
                    step.status === 'loading' && 'bg-primary animate-pulse',
                    step.status === 'pending' && 'bg-muted'
                  )}
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    step.status === 'complete' && 'text-green-600 line-through',
                    step.status === 'loading' && 'text-foreground font-medium',
                    step.status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Usage in page:**

```typescript
// app/[locale]/experiences/[id]/page.tsx

const [showLoadingModal, setShowLoadingModal] = useState(justPublished);

return (
  <>
    <DiscoveryLoadingModal
      isOpen={showLoadingModal}
      onComplete={() => setShowLoadingModal(false)}
    />
    {/* Rest of page */}
  </>
);
```

**Testing:**
- [ ] Modal shows when `justPublished=true`
- [ ] Steps progress automatically
- [ ] Progress bar animates smoothly
- [ ] Modal auto-dismisses on complete
- [ ] Animations are smooth
- [ ] Mobile: Full-screen layout

---

#### 1.3 Change Redirect Flow

**Files to Modify:**
- `components/submit-observatory/screen4/FilesWitnessesScreen.tsx`

**Changes:**
1. ✅ Already redirects to `/experiences/[id]?justPublished=true`
2. Add publishResult to session storage (done in 1.1)
3. Remove `/success/[id]` page references (if any)

**Testing:**
- [ ] Submit flow redirects to experience page
- [ ] Loading modal shows during API call
- [ ] Experience page loads with banner
- [ ] No broken links to old success page

---

### Phase 1 Checklist

- [ ] Fix JustPublishedBanner hardcoded values
- [ ] Create DiscoveryLoadingModal component
- [ ] Update FilesWitnessesScreen redirect
- [ ] Add query param parsing in experience page
- [ ] Add session storage handling
- [ ] Test complete submit → view flow
- [ ] Verify mobile experience
- [ ] Create PR and merge

**Success Criteria:**
- ✅ Real XP/badges displayed after publish
- ✅ Loading modal shows pattern discovery
- ✅ No console errors
- ✅ Works on page refresh

---

## 🎨 PHASE 2: New Core Components (Week 2)

**Goal:** Add validation score, enhanced pattern context, impact tab

### Tasks

#### 2.1 Create ValidationScoreCard Component

**New File:** `components/experience-detail/ValidationScoreCard.tsx`

**API Endpoint Required:** `/api/experiences/[id]/validation`

**Database Query:**
```sql
SELECT
  COUNT(em.id) as similar_count,
  AVG(em.match_score) as avg_match_quality,
  EXISTS(
    SELECT 1 FROM experience_patterns ep
    WHERE ep.experience_id = $1
    AND ep.pattern_type = 'trending'
  ) as is_trending,
  EXISTS(
    SELECT 1 FROM experience_patterns ep
    WHERE ep.experience_id = $1
    AND ep.pattern_type = 'geographic_wave'
  ) as is_in_wave
FROM experience_matches em
WHERE em.experience_id = $1;
```

**Component Implementation:**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Waves, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ValidationScoreCardProps {
  experienceId: string;
}

interface ValidationData {
  similar_count: number;
  avg_match_quality: number;
  is_trending: boolean;
  is_in_wave: boolean;
}

export function ValidationScoreCard({ experienceId }: ValidationScoreCardProps) {
  const { data, isLoading } = useQuery<ValidationData>(
    ['validation', experienceId],
    () => fetch(`/api/experiences/${experienceId}/validation`).then(res => res.json())
  );

  if (isLoading) {
    return <ValidationScoreCardSkeleton />;
  }

  if (!data) return null;

  const validationBadge = data.is_trending
    ? { icon: TrendingUp, label: 'Trending', color: 'bg-orange-500' }
    : data.is_in_wave
    ? { icon: Waves, label: 'Part of Wave', color: 'bg-blue-500' }
    : null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
      <div className="flex items-center justify-between">
        {/* Similar Count */}
        <div className="flex items-center space-x-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <div>
            <motion.p
              className="text-3xl font-bold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {data.similar_count}
            </motion.p>
            <p className="text-sm text-muted-foreground">similar experiences</p>
          </div>
        </div>

        {/* Match Quality */}
        <div className="text-right">
          <p className="text-2xl font-bold">{Math.round(data.avg_match_quality)}%</p>
          <p className="text-sm text-muted-foreground">match quality</p>
        </div>

        {/* Validation Badge */}
        {validationBadge && (
          <Badge className={cn(validationBadge.color, "text-white")}>
            <validationBadge.icon className="mr-1 h-3 w-3" />
            {validationBadge.label}
          </Badge>
        )}
      </div>
    </Card>
  );
}
```

**Testing:**
- [ ] Card displays correct similar count
- [ ] Match quality percentage shows correctly
- [ ] Trending badge appears when applicable
- [ ] Wave badge appears when applicable
- [ ] Count-up animation works
- [ ] Skeleton shows during loading
- [ ] Mobile: Responsive layout

---

#### 2.2 Enhance PatternContextCard

**File to Modify:** `components/experience-detail/PatternContextCard.tsx` (or create new)

**API Endpoint Required:** `/api/experiences/[id]/patterns`

**Database Query:**
```sql
-- Geographic patterns
SELECT
  center_lat,
  center_lng,
  radius_km,
  COUNT(*) as experience_count,
  (COUNT(*) - baseline_count) / baseline_count * 100 as increase_percent
FROM geographic_patterns
WHERE experience_id = $1
GROUP BY center_lat, center_lng, radius_km, baseline_count;

-- Temporal patterns
SELECT
  pattern_type,
  start_date,
  end_date,
  experience_count,
  spike_date,
  confidence
FROM temporal_patterns
WHERE experience_id = $1;
```

**Component Implementation:**

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PatternContextCardProps {
  experienceId: string;
}

interface PatternData {
  geographic_patterns: GeographicPattern[];
  temporal_patterns: TemporalPattern[];
}

interface GeographicPattern {
  center_lat: number;
  center_lng: number;
  radius_km: number;
  experience_count: number;
  increase_percent: number;
}

interface TemporalPattern {
  pattern_type: string;
  start_date: string;
  end_date: string;
  experience_count: number;
  spike_date: string;
  confidence: number;
}

export function PatternContextCard({ experienceId }: PatternContextCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data } = useQuery<PatternData>(
    ['patterns', experienceId],
    () => fetch(`/api/experiences/${experienceId}/patterns`).then(res => res.json())
  );

  if (!data || (data.geographic_patterns.length === 0 && data.temporal_patterns.length === 0)) {
    return null;
  }

  const primaryPattern = data.geographic_patterns[0] || data.temporal_patterns[0];

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent overflow-hidden">
      <div className="p-6">
        {/* Collapsed View */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Waves className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">Pattern Detected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {data.geographic_patterns.length > 0
                  ? `You're part of a geographic wave`
                  : `You're part of a temporal pattern`}
              </p>
              {data.geographic_patterns[0] && (
                <p className="text-sm mt-1">
                  {data.geographic_patterns[0].experience_count} experiences in{' '}
                  {data.geographic_patterns[0].radius_km}km radius
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 space-y-4"
              >
                {/* Mini Visualization - Placeholder */}
                <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">[Mini Chart]</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {data.geographic_patterns[0] && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Radius</p>
                        <p className="text-lg font-semibold">
                          {data.geographic_patterns[0].radius_km}km
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Increase</p>
                        <p className="text-lg font-semibold text-green-600">
                          +{Math.round(data.geographic_patterns[0].increase_percent)}%
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Explanation */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    💡 Why this matters
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    This suggests a localized phenomenon that multiple people are experiencing
                    in the same geographic area.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="#patterns-tab">View Map →</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="#patterns-tab">View Timeline →</a>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
```

**Testing:**
- [ ] Card only shows when patterns exist
- [ ] Collapsed state shows summary
- [ ] Expanded state shows details
- [ ] Animation is smooth
- [ ] CTAs link to Patterns tab
- [ ] Mobile: Opens as bottom sheet (optional)

---

#### 2.3 Create ImpactTab Component

**New File:** `components/experience-detail/ImpactTab.tsx`

**API Endpoint Required:** `/api/experiences/[id]/impact`

**Database Queries:**
```sql
-- Contribution Score
SELECT
  novelty_score,
  pattern_contribution_score,
  community_value_score,
  (novelty_score + pattern_contribution_score + community_value_score) / 3 as overall_score
FROM experience_contribution
WHERE experience_id = $1;

-- XP Twins
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.level,
  COUNT(DISTINCT em.id) as shared_experiences_count,
  AVG(em.match_score) as avg_match_score
FROM users u
INNER JOIN experiences e ON e.user_id = u.id
INNER JOIN experience_matches em ON (em.experience_id = e.id OR em.matched_experience_id = e.id)
WHERE em.experience_id IN (
  SELECT id FROM experiences WHERE user_id = $2
)
AND u.id != $2
GROUP BY u.id
HAVING COUNT(DISTINCT em.id) >= 3 AND AVG(em.match_score) >= 70
ORDER BY avg_match_score DESC
LIMIT 10;

-- Smart Next Steps (Algorithm-based)
-- This would be generated based on user behavior, contribution score, etc.
```

**Component Implementation:**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Users, ArrowRight } from 'lucide-react';

interface ImpactTabProps {
  experienceId: string;
  userId: string;
}

interface ImpactData {
  contribution_score: ContributionScore;
  xp_twins: XPTwin[];
  smart_next_steps: NextStep[];
}

interface ContributionScore {
  overall_score: number;
  breakdown: {
    novelty: number;
    pattern_contribution: number;
    community_value: number;
  };
  level: 'minor' | 'moderate' | 'significant' | 'major';
  explanation: string;
}

interface XPTwin {
  user_id: string;
  username: string;
  avatar_url?: string;
  level: number;
  match_score: number;
  shared_experiences_count: number;
  shared_categories: string[];
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

export function ImpactTab({ experienceId, userId }: ImpactTabProps) {
  const { data, isLoading } = useQuery<ImpactData>(
    ['impact', experienceId],
    () => fetch(`/api/experiences/${experienceId}/impact`).then(res => res.json())
  );

  if (isLoading) {
    return <ImpactTabSkeleton />;
  }

  if (!data) return null;

  const scoreColor =
    data.contribution_score.level === 'major' ? 'text-purple-600' :
    data.contribution_score.level === 'significant' ? 'text-blue-600' :
    data.contribution_score.level === 'moderate' ? 'text-green-600' :
    'text-gray-600';

  return (
    <div className="space-y-8">
      {/* Contribution Score Section */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-primary" />
              Your Contribution
            </h3>
            <p className="text-muted-foreground mt-1">
              How this experience adds value to the community
            </p>
          </div>
          <Badge className={scoreColor}>
            {data.contribution_score.level}
          </Badge>
        </div>

        {/* Overall Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Score</span>
            <span className="text-2xl font-bold">{Math.round(data.contribution_score.overall_score)}</span>
          </div>
          <Progress value={data.contribution_score.overall_score} className="h-3" />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Novelty</p>
            <p className="text-xl font-semibold">{Math.round(data.contribution_score.breakdown.novelty)}</p>
            <Progress value={data.contribution_score.breakdown.novelty} className="h-2 mt-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pattern Contribution</p>
            <p className="text-xl font-semibold">{Math.round(data.contribution_score.breakdown.pattern_contribution)}</p>
            <Progress value={data.contribution_score.breakdown.pattern_contribution} className="h-2 mt-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Community Value</p>
            <p className="text-xl font-semibold">{Math.round(data.contribution_score.breakdown.community_value)}</p>
            <Progress value={data.contribution_score.breakdown.community_value} className="h-2 mt-2" />
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-muted rounded-md p-4">
          <p className="text-sm">{data.contribution_score.explanation}</p>
        </div>
      </Card>

      {/* XP Twins Section */}
      {data.xp_twins.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold flex items-center mb-4">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Your XP Twins
          </h3>
          <p className="text-muted-foreground mb-6">
            Users with highly similar experiences to yours
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.xp_twins.map(twin => (
              <Card key={twin.user_id} className="p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={twin.avatar_url} />
                      <AvatarFallback>{twin.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{twin.username}</p>
                      <p className="text-sm text-muted-foreground">Level {twin.level}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{Math.round(twin.match_score)}% match</Badge>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  {twin.shared_experiences_count} shared experiences
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {twin.shared_categories.slice(0, 3).map(cat => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4">
                  Connect
                </Button>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Smart Next Steps Section */}
      {data.smart_next_steps.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Smart Next Steps</h3>
          <p className="text-muted-foreground mb-6">
            Personalized suggestions to deepen your engagement
          </p>

          <div className="space-y-3">
            {data.smart_next_steps.map(step => (
              <Card key={step.id} className="p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                  <Button size="sm" asChild>
                    <a href={step.cta_action}>
                      {step.cta_label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
```

**Testing:**
- [ ] Contribution score displays correctly
- [ ] Breakdown shows novelty, pattern, community values
- [ ] XP Twins list shows users with high matches
- [ ] Connect button works
- [ ] Smart Next Steps show personalized suggestions
- [ ] Mobile: Responsive grid layout

---

### Phase 2 Checklist

- [ ] Create ValidationScoreCard component
- [ ] Create `/api/experiences/[id]/validation` endpoint
- [ ] Enhance PatternContextCard with expansion
- [ ] Create `/api/experiences/[id]/patterns` endpoint
- [ ] Create ImpactTab component
- [ ] Create `/api/experiences/[id]/impact` endpoint
- [ ] Integrate new components into experience page
- [ ] Test all new components
- [ ] Verify mobile responsiveness
- [ ] Create PR and merge

**Success Criteria:**
- ✅ Validation score shows correct data
- ✅ Pattern card expands/collapses smoothly
- ✅ Impact tab shows contribution score and XP Twins
- ✅ All API endpoints return correct data

---

## 🔍 PHASE 3: Match Explanations (Week 3)

**Goal:** Add transparency to matching algorithm with explanations and highlights

### Tasks

#### 3.1 Add MatchExplanation Component to SimilarTab

**New File:** `components/experience-detail/MatchExplanation.tsx`

**API Modification:** `/api/experiences/[id]/similar` (add match reasons)

**Database Query:**
```sql
-- Calculate match reasons
SELECT
  em.match_score,
  ARRAY_AGG(DISTINCT
    CASE
      WHEN em.category_match THEN JSON_BUILD_OBJECT(
        'type', 'category',
        'label', 'Same category',
        'confidence', 95,
        'details', cat.name
      )
      -- Add more match reason types
    END
  ) as match_reasons
FROM experience_matches em
LEFT JOIN categories cat ON cat.id = e.category_id
WHERE em.experience_id = $1
GROUP BY em.id;
```

**Implementation:** (See component spec in 04-components-spec.md)

**Testing:**
- [ ] Match reasons show for each similar experience
- [ ] Reasons are collapsible/expandable
- [ ] Confidence scores display correctly
- [ ] Highlighted text shows in details
- [ ] Mobile: Proper layout

---

#### 3.2 Implement TextHighlighter in StoryContent

**File to Modify:** `components/experience-detail/StoryContent.tsx`

**New File:** `components/experience-detail/TextHighlighter.tsx`

**Algorithm:**
1. Get matching keywords from similar experiences
2. Find keyword positions in text
3. Wrap with highlight `<mark>` tags
4. Add tooltip with context on hover

**Implementation:**

```typescript
'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TextHighlight {
  start: number;
  end: number;
  type: 'keyword' | 'attribute' | 'location' | 'temporal';
  tooltip: string;
}

interface TextHighlighterProps {
  text: string;
  highlights: TextHighlight[];
}

export function TextHighlighter({ text, highlights }: TextHighlighterProps) {
  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

  // Build segments
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedHighlights.forEach((highlight, idx) => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      segments.push(text.substring(lastIndex, highlight.start));
    }

    // Add highlighted text with tooltip
    const highlightedText = text.substring(highlight.start, highlight.end);
    segments.push(
      <Tooltip key={`highlight-${idx}`} delayDuration={300}>
        <TooltipTrigger asChild>
          <mark
            className={cn(
              "bg-yellow-200 dark:bg-yellow-900/40 rounded px-0.5 cursor-help",
              highlight.type === 'attribute' && "bg-blue-200 dark:bg-blue-900/40",
              highlight.type === 'location' && "bg-green-200 dark:bg-green-900/40",
              highlight.type === 'temporal' && "bg-purple-200 dark:bg-purple-900/40"
            )}
          >
            {highlightedText}
          </mark>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{highlight.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );

    lastIndex = highlight.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(text.substring(lastIndex));
  }

  return <>{segments}</>;
}
```

**Testing:**
- [ ] Keywords are highlighted
- [ ] Tooltips show on hover
- [ ] Different colors for different highlight types
- [ ] No overlapping highlights
- [ ] Performance is good for long texts

---

### Phase 3 Checklist

- [ ] Create MatchExplanation component
- [ ] Update `/api/experiences/[id]/similar` to include match reasons
- [ ] Create TextHighlighter component
- [ ] Integrate TextHighlighter into StoryContent
- [ ] Generate highlights from matching algorithm
- [ ] Test match explanations
- [ ] Test text highlights
- [ ] Create PR and merge

**Success Criteria:**
- ✅ Users see WHY experiences match
- ✅ Keywords are highlighted inline
- ✅ Tooltips provide context
- ✅ Transparency builds trust

---

## 📊 PHASE 4: Advanced Analytics (Week 4-5)

**Goal:** Implement geographic heatmap, timeline charts, correlation matrix

### Tasks

#### 4.1 Implement GeographicHeatmap Component

**New File:** `components/experience-detail/GeographicHeatmap.tsx`

**Library:** `react-map-gl` or `@vis.gl/react-google-maps`

**API Data:** From `/api/experiences/[id]/patterns/analytics`

**Implementation:**
- Interactive map with clusters
- Heatmap overlay
- Current experience highlighted
- Click cluster to see details

**Testing:**
- [ ] Map loads correctly
- [ ] Clusters show experience counts
- [ ] Heatmap displays density
- [ ] Current experience is highlighted
- [ ] Mobile: Touch interactions work

---

#### 4.2 Implement TimelineChart Component

**New File:** `components/experience-detail/TimelineChart.tsx`

**Library:** `recharts` or `visx`

**Implementation:**
- Area chart showing experience count over time
- Spike annotations
- Current experience highlighted
- Zoom/pan functionality

**Testing:**
- [ ] Timeline displays correctly
- [ ] Spikes are annotated
- [ ] Current experience is marked
- [ ] Zoom/pan works
- [ ] Mobile: Responsive chart

---

#### 4.3 Implement CorrelationMatrix Component

**New File:** `components/experience-detail/CorrelationMatrix.tsx`

**Implementation:**
- Heatmap of attribute correlations
- Hover shows details
- Click to filter by attribute pair

**Testing:**
- [ ] Matrix displays correlations
- [ ] Color coding is clear
- [ ] Hover shows details
- [ ] Click filters work

---

### Phase 4 Checklist

- [ ] Implement GeographicHeatmap
- [ ] Implement TimelineChart
- [ ] Implement CorrelationMatrix
- [ ] Create `/api/experiences/[id]/patterns/analytics` endpoint
- [ ] Integrate into PatternsTab
- [ ] Test all visualizations
- [ ] Optimize performance (lazy loading)
- [ ] Create PR and merge

**Success Criteria:**
- ✅ Geographic patterns visible on map
- ✅ Temporal patterns visible on timeline
- ✅ Attribute correlations visible in matrix
- ✅ All visualizations are interactive

---

## 👥 PHASE 5: Community Features (Week 5-6)

**Goal:** Enhance XP Twins, add Smart Next Steps, improve comments

### Tasks

#### 5.1 Implement XP Twins Connection System

**Files:**
- `components/experience-detail/ImpactTab.tsx` (enhance)
- `/api/users/[id]/connect` (new endpoint)

**Features:**
- Follow/unfollow users
- Send DM (if messaging exists)
- View twin's profile
- Filter twins by category

**Testing:**
- [ ] Connect button works
- [ ] Follow/unfollow updates UI
- [ ] View profile link works

---

#### 5.2 Generate Smart Next Steps Algorithm

**New File:** `lib/algorithms/smart-next-steps.ts`

**Logic:**
```typescript
function generateSmartNextSteps(user: User, experience: Experience): NextStep[] {
  const steps: NextStep[] = [];

  // If user has < 5 experiences, suggest submitting more
  if (user.experience_count < 5) {
    steps.push({
      type: 'contribute',
      title: 'Share another experience',
      description: 'The more you share, the better the pattern matching becomes',
      cta_label: 'Submit Experience',
      cta_action: '/submit',
      priority: 1
    });
  }

  // If experience has high similar count, suggest exploring
  if (experience.similar_count > 10) {
    steps.push({
      type: 'explore',
      title: 'Explore similar patterns',
      description: `${experience.similar_count} experiences match yours - discover connections`,
      cta_label: 'View Patterns',
      cta_action: '#patterns-tab',
      priority: 2
    });
  }

  // If XP Twins exist, suggest connecting
  if (experience.xp_twins_count > 0) {
    steps.push({
      type: 'connect',
      title: 'Connect with your XP Twins',
      description: 'Build relationships with people who have similar experiences',
      cta_label: 'View Twins',
      cta_action: '#impact-tab',
      priority: 3
    });
  }

  return steps.sort((a, b) => a.priority - b.priority);
}
```

**Testing:**
- [ ] Algorithm generates relevant steps
- [ ] Steps are prioritized correctly
- [ ] CTAs navigate to correct locations

---

### Phase 5 Checklist

- [ ] Implement XP Twins connection system
- [ ] Create Smart Next Steps algorithm
- [ ] Enhance comments with threading
- [ ] Add markdown support to comments
- [ ] Test all community features
- [ ] Create PR and merge

**Success Criteria:**
- ✅ Users can connect with XP Twins
- ✅ Smart Next Steps guide user engagement
- ✅ Comments are more engaging

---

## ✨ PHASE 6: Polish & Optimization (Week 7-8)

**Goal:** Animations, performance optimization, accessibility, comprehensive testing

### Tasks

#### 6.1 Add Framer Motion Animations

**Files:** All components

**Animations to Add:**
- Card entrance (fade + slide)
- Tab switching (slide)
- Expandable sections (height + fade)
- Loading states (pulse)
- Success states (bounce)

**Testing:**
- [ ] All animations are smooth (60fps)
- [ ] Reduced motion preference respected
- [ ] No animation janks

---

#### 6.2 Performance Optimization

**Tasks:**
- [ ] Code split heavy components (maps, charts)
- [ ] Lazy load images with blur placeholders
- [ ] Implement virtualization for long lists
- [ ] Optimize bundle size (tree shaking)
- [ ] Add React Query caching
- [ ] Prefetch on hover (desktop)
- [ ] Debounce search inputs

**Testing:**
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size optimized

---

#### 6.3 Accessibility Audit

**Tasks:**
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation complete
- [ ] Screen reader testing
- [ ] Focus states visible
- [ ] ARIA labels complete
- [ ] Color contrast ratios meet standards
- [ ] Skip links functional

**Testing:**
- [ ] axe DevTools: No violations
- [ ] NVDA/JAWS testing
- [ ] Keyboard-only navigation test
- [ ] Mobile screen reader test

---

#### 6.4 Comprehensive Testing

**Unit Tests:**
- [ ] All components have tests
- [ ] API endpoints have tests
- [ ] Algorithms have tests
- [ ] Utilities have tests

**Integration Tests:**
- [ ] Submit → View flow
- [ ] Tab navigation
- [ ] Filter/sort functionality
- [ ] Comment posting

**E2E Tests:**
- [ ] Complete user journeys
- [ ] Cross-browser testing
- [ ] Mobile device testing

---

### Phase 6 Checklist

- [ ] Add all animations
- [ ] Optimize performance
- [ ] Complete accessibility audit
- [ ] Write comprehensive tests
- [ ] Fix all bugs
- [ ] Documentation complete
- [ ] Create final PR
- [ ] Deploy to production

**Success Criteria:**
- ✅ Lighthouse score > 90
- ✅ WCAG 2.1 AA compliant
- ✅ Test coverage > 80%
- ✅ No critical bugs
- ✅ User testing positive

---

## 🔄 Rollback Strategy

If critical issues arise:

### Quick Rollback (Emergency)
1. Revert Git commits
2. Redeploy previous version
3. Verify production is stable

### Graceful Rollback (Planned)
1. Feature flag toggle (if implemented)
2. Keep old components alongside new
3. Gradually migrate users

### Feature Flags (Recommended)
```typescript
const useNewExperienceDesign = useFeatureFlag('new-experience-design');

return useNewExperienceDesign
  ? <NewExperienceDetailPage />
  : <LegacyExperienceDetailPage />;
```

---

## 📊 Success Metrics Tracking

### Engagement Metrics
- Time on Post Page: Target > 3 min
- Tab Interaction Rate: Target > 60%
- Similar XP Click-Through: Target > 40%
- Comment Conversion: Target > 15%

### User Satisfaction
- Post-publish survey: "I felt validated" > 80%
- "I understood patterns" > 70%
- "I felt part of community" > 75%

### Performance Metrics
- Page Load Time < 2s
- Time to Interactive < 3s
- Lighthouse Score > 90

### Technical Metrics
- Test Coverage > 80%
- Zero critical accessibility violations
- Zero console errors

---

## 📝 Final Checklist

### Code Quality
- [ ] All code reviewed
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] TypeScript strict mode passing
- [ ] ESLint passing
- [ ] Prettier formatted

### Documentation
- [ ] All components documented
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] README updated

### Deployment
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Monitoring configured
- [ ] Error tracking configured
- [ ] Analytics tracking added

### User Communication
- [ ] Changelog published
- [ ] User guide created
- [ ] Support team trained
- [ ] Feedback channels prepared

---

**Congratulations!** You've successfully implemented the XPShare Post V2 redesign. 🎉

**Next Steps:**
1. Monitor metrics for 2 weeks
2. Gather user feedback
3. Iterate on improvements
4. Plan V3 features

---

**See also:**
- [00-overview.md](./00-overview.md) - Project overview
- [04-components-spec.md](./04-components-spec.md) - Component specifications
- [05-interaction-patterns.md](./05-interaction-patterns.md) - Interaction details

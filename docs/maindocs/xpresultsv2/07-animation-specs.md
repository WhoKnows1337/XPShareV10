# Animation Specifications

## 🎬 Overview

This document contains detailed specifications for all animations in the XPShare Post V2 design. Every animation is defined with exact timings, easing functions, and implementation code.

**Animation Philosophy:**
- Purposeful, not decorative
- Enhance understanding, not distract
- Respect `prefers-reduced-motion`
- 60fps performance minimum

---

## 🚀 Post-Publish Animations

### 1. DiscoveryLoadingModal - Radar Animation

**Purpose:** Show pattern discovery in progress with engaging visual feedback

**Duration:** 3-4 seconds total (auto-progress through 4 steps)

#### Step 1: Analyzing (0-1s)

**Icon:** Sparkles with pulse effect

```typescript
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.6, 1, 0.6]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <Sparkles className="h-16 w-16 text-primary" />
</motion.div>
```

**Label Animation:**
```typescript
<motion.p
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Analyzing your experience...
</motion.p>
```

---

#### Step 2: Finding Similar (1-2.5s)

**Icon:** Search with radar sweep effect

```typescript
// Radar Sweep Animation
<svg width="64" height="64" viewBox="0 0 64 64">
  {/* Outer ring */}
  <circle
    cx="32"
    cy="32"
    r="28"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    opacity="0.2"
  />

  {/* Radar sweep */}
  <motion.line
    x1="32"
    y1="32"
    x2="32"
    y2="4"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    animate={{
      rotate: 360
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }}
    style={{ transformOrigin: "32px 32px" }}
  />

  {/* Detected points (appear during sweep) */}
  <motion.circle
    cx="20"
    cy="15"
    r="3"
    fill="currentColor"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.3, duration: 0.2 }}
  />
  <motion.circle
    cx="45"
    cy="25"
    r="3"
    fill="currentColor"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.6, duration: 0.2 }}
  />
  <motion.circle
    cx="38"
    cy="48"
    r="3"
    fill="currentColor"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.9, duration: 0.2 }}
  />
</svg>
```

**Count-up Animation:**
```typescript
// Animated counter from 1 → 12
const [count, setCount] = useState(0);

useEffect(() => {
  const targetCount = 12;
  const duration = 1500; // 1.5s
  const steps = 20;
  const increment = targetCount / steps;
  const stepDuration = duration / steps;

  let currentCount = 0;
  const timer = setInterval(() => {
    currentCount += increment;
    if (currentCount >= targetCount) {
      setCount(targetCount);
      clearInterval(timer);
    } else {
      setCount(Math.floor(currentCount));
    }
  }, stepDuration);

  return () => clearInterval(timer);
}, []);

// Display with animation
<motion.span
  key={count}
  initial={{ scale: 1.2, color: '#4A90E2' }}
  animate={{ scale: 1, color: 'inherit' }}
  transition={{ duration: 0.2 }}
>
  {count}
</motion.span>
```

---

#### Step 3: Detecting Patterns (2.5-3.5s)

**Icon:** TrendingUp with wave effect

```typescript
<motion.div
  animate={{
    y: [0, -5, 0],
  }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <TrendingUp className="h-16 w-16 text-primary" />

  {/* Wave lines behind icon */}
  <svg className="absolute inset-0" viewBox="0 0 64 64">
    <motion.path
      d="M 10,32 Q 20,20 32,32 T 54,32"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </svg>
</motion.div>
```

---

#### Step 4: Done! (3.5-4s)

**Icon:** Check with bounce

```typescript
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{
    type: "spring",
    stiffness: 260,
    damping: 20
  }}
>
  <motion.div
    animate={{
      scale: [1, 1.1, 1]
    }}
    transition={{
      duration: 0.5,
      times: [0, 0.5, 1]
    }}
  >
    <Check className="h-16 w-16 text-green-500" />
  </motion.div>
</motion.div>
```

**Success Ripple Effect:**
```typescript
<motion.div
  className="absolute inset-0 border-2 border-green-500 rounded-full"
  initial={{ scale: 0.8, opacity: 1 }}
  animate={{ scale: 2, opacity: 0 }}
  transition={{ duration: 0.8 }}
/>
```

---

#### Progress Bar Animation

```typescript
<motion.div
  className="h-2 bg-primary rounded-full"
  initial={{ width: "0%" }}
  animate={{ width: `${progress}%` }}
  transition={{
    duration: 0.3,
    ease: "easeOut"
  }}
/>

// Progress updates per step:
// Step 1: 0% → 25%
// Step 2: 25% → 50%
// Step 3: 50% → 90%
// Step 4: 90% → 100%
```

---

### 2. JustPublishedBanner - Celebration Animation

**Duration:** 2-3 seconds display + auto-dismiss after 10 seconds

**Design Decision:** Show for **10 seconds** with option to dismiss anytime
- Longer than initial concept (2-3s) to ensure user sees rewards
- User can dismiss immediately if they want
- Pause auto-dismiss on hover

#### Banner Entrance

```typescript
<motion.div
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: -100, opacity: 0 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30
  }}
  className="sticky top-0 z-50 bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur"
>
  {/* Banner content */}
</motion.div>
```

#### XP Count-up Animation

```typescript
// Animate from 0 → actual XP earned
<motion.span
  className="text-3xl font-bold"
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 15,
    delay: 0.2
  }}
>
  <AnimatedNumber value={xpEarned} duration={1000} />
</motion.span>
```

#### Badge Fly-in Animation

```typescript
// Badge flies in from right with rotation
{badgesEarned.map((badge, idx) => (
  <motion.div
    key={badge.id}
    initial={{
      x: 100,
      y: -50,
      rotate: 45,
      opacity: 0,
      scale: 0
    }}
    animate={{
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      scale: 1
    }}
    transition={{
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.5 + (idx * 0.2) // Stagger multiple badges
    }}
  >
    <img src={badge.icon_url} alt={badge.name} className="h-12 w-12" />

    {/* Shine effect */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{
        duration: 0.5,
        delay: 0.8 + (idx * 0.2)
      }}
    />
  </motion.div>
))}
```

#### Level-up Confetti

**Trigger:** Only if `leveledUp === true`

```typescript
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

{leveledUp && (
  <Confetti
    width={width}
    height={height}
    recycle={false}
    numberOfPieces={200}
    gravity={0.3}
    colors={['#D4A76A', '#6B46C1', '#4A90E2', '#7FB069', '#F59E42']}
    tweenDuration={4000}
  />
)}
```

#### Level Badge Bounce

```typescript
<motion.div
  className="flex items-center space-x-2 bg-primary/20 rounded-full px-4 py-2"
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 15,
    delay: 0.3
  }}
>
  <motion.span
    animate={{
      rotate: [0, -10, 10, -10, 0]
    }}
    transition={{
      duration: 0.5,
      delay: 0.5
    }}
  >
    ⭐
  </motion.span>
  <span className="font-bold">
    Level {oldLevel} → {newLevel}
  </span>
</motion.div>
```

---

### 3. ValidationScoreCard - Trust Signal Animation

#### Count-up Animation for Similar Count

```typescript
// AnimatedNumber component
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 20;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let currentValue = 0;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(currentValue));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// Usage
<motion.p
  className="text-3xl font-bold"
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    type: "spring",
    stiffness: 200,
    damping: 20
  }}
>
  <AnimatedNumber value={similarCount} duration={1500} />
</motion.p>
```

#### Match Quality Ring Animation

```typescript
// Circular progress ring
<svg width="80" height="80">
  <circle
    cx="40"
    cy="40"
    r="35"
    stroke="hsl(var(--muted))"
    strokeWidth="6"
    fill="none"
  />
  <motion.circle
    cx="40"
    cy="40"
    r="35"
    stroke="hsl(var(--primary))"
    strokeWidth="6"
    fill="none"
    strokeLinecap="round"
    strokeDasharray={`${2 * Math.PI * 35}`}
    initial={{ strokeDashoffset: `${2 * Math.PI * 35}` }}
    animate={{
      strokeDashoffset: `${2 * Math.PI * 35 * (1 - matchQuality / 100)}`
    }}
    transition={{
      duration: 1.5,
      ease: "easeOut",
      delay: 0.3
    }}
    style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
  />
</svg>
```

#### Pulse Animation for High Match Quality (>85%)

```typescript
{matchQuality > 85 && (
  <motion.div
    className="absolute inset-0 bg-primary/20 rounded-lg"
    animate={{
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.6, 0.3]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
)}
```

---

## 🎨 Content Animations

### 4. PatternContextCard - Expansion Animation

#### Smooth Height Transition

```typescript
<AnimatePresence initial={false}>
  {isExpanded && (
    <motion.div
      key="content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        height: {
          duration: 0.3,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.2,
          ease: "easeOut"
        }
      }}
      className="overflow-hidden"
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

#### Chevron Rotation

```typescript
<motion.div
  animate={{ rotate: isExpanded ? 180 : 0 }}
  transition={{ duration: 0.2 }}
>
  <ChevronDown className="h-4 w-4" />
</motion.div>
```

#### Stagger Children Animation

```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate={isExpanded ? "visible" : "hidden"}
>
  {metrics.map((metric) => (
    <motion.div
      key={metric.id}
      variants={{
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {/* Metric content */}
    </motion.div>
  ))}
</motion.div>
```

---

### 5. Tab Switching Animation

#### Tab Content Fade & Slide

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{
      duration: 0.2,
      ease: "easeOut"
    }}
  >
    {/* Tab content */}
  </motion.div>
</AnimatePresence>
```

#### Active Tab Indicator Slide

```typescript
<motion.div
  className="absolute bottom-0 left-0 h-0.5 bg-primary"
  layoutId="activeTab"
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 40
  }}
  style={{
    width: activeTabWidth,
    x: activeTabOffset
  }}
/>
```

---

### 6. Similar Experiences List - Stagger Animation

```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="visible"
>
  {experiences.map((exp) => (
    <motion.div
      key={exp.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
          }
        }
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <ExperienceCard experience={exp} />
    </motion.div>
  ))}
</motion.div>
```

---

### 7. Text Highlight Animation

```typescript
<motion.mark
  className="bg-yellow-200 dark:bg-yellow-900/40 rounded px-0.5"
  initial={{ backgroundColor: "rgba(251, 191, 36, 0)" }}
  animate={{ backgroundColor: "rgba(251, 191, 36, 0.3)" }}
  transition={{
    duration: 0.5,
    delay: 0.2
  }}
  whileHover={{
    backgroundColor: "rgba(251, 191, 36, 0.5)"
  }}
>
  {highlightedText}
</motion.mark>
```

---

## 🎯 Microinteractions

### 8. Card Hover Animation

```typescript
<motion.div
  className="rounded-lg border border-border p-4"
  whileHover={{
    y: -4,
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    borderColor: "hsl(var(--primary) / 0.5)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }}
  whileTap={{
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }}
>
  {/* Card content */}
</motion.div>
```

---

### 9. Button Press Animation

```typescript
<motion.button
  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
  whileHover={{
    scale: 1.05,
    transition: { duration: 0.15 }
  }}
  whileTap={{
    scale: 0.95,
    transition: { duration: 0.1 }
  }}
>
  {label}
</motion.button>
```

---

### 10. Badge Appearance Animation

```typescript
<motion.div
  className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary"
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 20
  }}
>
  {badgeLabel}
</motion.div>
```

---

### 11. Tooltip Fade-in

```typescript
<AnimatePresence>
  {isVisible && (
    <motion.div
      className="absolute z-50 bg-popover text-popover-foreground rounded-md p-2 shadow-md"
      initial={{ opacity: 0, y: -5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      transition={{
        duration: 0.15,
        ease: "easeOut"
      }}
    >
      {tooltipContent}
    </motion.div>
  )}
</AnimatePresence>
```

---

### 12. Loading Spinner

```typescript
<motion.div
  className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }}
/>
```

---

### 13. Skeleton Pulse

```typescript
<motion.div
  className="h-4 bg-muted rounded"
  animate={{
    opacity: [0.5, 1, 0.5]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

---

## 📊 Data Visualization Animations

### 14. Chart Bar Growth

```typescript
<motion.rect
  x={x}
  y={y}
  width={width}
  height={0}
  fill="currentColor"
  initial={{ height: 0, y: chartHeight }}
  animate={{ height: barHeight, y: chartHeight - barHeight }}
  transition={{
    duration: 0.8,
    delay: index * 0.05,
    ease: "easeOut"
  }}
/>
```

---

### 15. Timeline Point Appearance

```typescript
<motion.circle
  cx={x}
  cy={y}
  r={5}
  fill="currentColor"
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 20,
    delay: index * 0.03
  }}
/>
```

---

### 16. Map Marker Bounce

```typescript
<motion.div
  className="absolute"
  style={{ left: x, top: y }}
  initial={{ y: -50, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{
    type: "spring",
    stiffness: 200,
    damping: 15,
    delay: index * 0.1
  }}
  whileHover={{
    scale: 1.2,
    zIndex: 10
  }}
>
  <MapPin className="h-6 w-6 text-primary" />
</motion.div>
```

---

## 🌊 Wave & Flow Animations

### 17. Geographic Wave Ripple

```typescript
<svg viewBox="0 0 100 100">
  {[1, 2, 3].map((ring, idx) => (
    <motion.circle
      key={ring}
      cx="50"
      cy="50"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      initial={{ r: 10, opacity: 0.8 }}
      animate={{
        r: 40,
        opacity: 0,
        transition: {
          duration: 2,
          repeat: Infinity,
          delay: idx * 0.6,
          ease: "easeOut"
        }
      }}
    />
  ))}
</svg>
```

---

### 18. Pattern Pulse Effect

```typescript
<motion.div
  className="absolute inset-0 bg-blue-500/20 rounded-lg"
  animate={{
    scale: [1, 1.1, 1],
    opacity: [0.2, 0.4, 0.2]
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

---

## ♿ Accessibility Considerations

### Reduced Motion Support

```typescript
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
      transition={shouldReduceMotion ? {} : {
        duration: 1,
        repeat: Infinity
      }}
    >
      {content}
    </motion.div>
  );
}
```

---

## 🎯 Animation Performance Guidelines

### Best Practices

1. **Use GPU-accelerated properties:**
   - ✅ `transform` (translate, scale, rotate)
   - ✅ `opacity`
   - ❌ Avoid animating `width`, `height`, `top`, `left`

2. **Use `will-change` sparingly:**
   ```css
   .animated-element {
     will-change: transform, opacity;
   }
   ```

3. **Use layout animations carefully:**
   ```typescript
   // Expensive - causes reflow
   <motion.div animate={{ width: 200 }} />

   // Better - GPU accelerated
   <motion.div animate={{ scaleX: 2 }} />
   ```

4. **Debounce scroll animations:**
   ```typescript
   const { scrollY } = useViewportScroll();
   const y = useTransform(scrollY, [0, 300], [0, -50]);

   return <motion.div style={{ y }} />;
   ```

---

## 📋 Animation Implementation Checklist

### Per Animation
- [ ] Duration specified
- [ ] Easing function defined
- [ ] `prefers-reduced-motion` respected
- [ ] Performance tested (60fps)
- [ ] Mobile tested
- [ ] Delay calculated (if staggered)
- [ ] Exit animation defined
- [ ] Loading/error states handled

### Global
- [ ] Framer Motion installed
- [ ] Animation tokens in design system
- [ ] Performance monitoring enabled
- [ ] Accessibility tested
- [ ] Cross-browser tested

---

## 🎬 Complete Animation Timeline

```
POST-PUBLISH FLOW:
0.0s  → User clicks "Publish"
0.1s  → DiscoveryLoadingModal opens (fade + scale)
1.0s  → Step 1 complete (Analyzing)
2.5s  → Step 2 complete (Finding Similar) + count animates 1→12
3.5s  → Step 3 complete (Detecting Patterns)
4.0s  → Step 4 complete (Done!) + success ripple
4.5s  → Modal dismisses, page navigates
5.0s  → JustPublishedBanner slides in from top
5.2s  → XP count-up animation (0 → actual XP)
5.5s  → Badge flies in with rotation
5.8s  → Level-up confetti (if leveledUp)
6.0s  → All celebrations visible
16.0s → Banner auto-dismisses (10s visible)

PAGE LOAD:
0.0s  → Skeleton screens show
0.3s  → ValidationScoreCard appears + ring animates
0.5s  → Similar count animates (0 → actual)
0.8s  → PatternContextCard fades in
1.0s  → Story content loads
1.2s  → Text highlights appear (stagger)
1.5s  → Tab content ready
```

---

## 🔧 Animation Utilities

### Reusable Animation Variants

```typescript
// lib/animations/variants.ts

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const scaleIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

export const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};
```

### Custom Hooks

```typescript
// hooks/useCountUp.ts
export function useCountUp(target: number, duration: number = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const steps = 20;
    const increment = target / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target, duration]);

  return value;
}

// Usage:
const displayCount = useCountUp(similarCount, 1500);
```

---

**See also:**
- [05-interaction-patterns.md](./05-interaction-patterns.md) - General interaction patterns
- [03-visual-design.md](./03-visual-design.md) - Visual design system
- [06-implementation-roadmap.md](./06-implementation-roadmap.md) - Implementation plan

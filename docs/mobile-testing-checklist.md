# Mobile Responsiveness Testing Checklist

## Test Devices / Viewports
- [ ] Mobile Portrait: 375px (iPhone SE)
- [ ] Mobile Landscape: 667px (iPhone SE rotated)
- [ ] Tablet Portrait: 768px (iPad Mini)
- [ ] Tablet Landscape: 1024px (iPad)
- [ ] Desktop: 1280px+

## Components to Test

### UnifiedSearchBar
- [ ] Search input expands full width on mobile
- [ ] Autocomplete dropdown doesn't overflow viewport
- [ ] Intent badges stack properly on narrow screens
- [ ] Ask Mode toggle button visible and tappable (44px min)
- [ ] Search button not cut off

### CollapsibleFilters
- [ ] Filter button full width on mobile
- [ ] Expanded panel doesn't overflow
- [ ] Category dropdown readable on small screens
- [ ] Date range inputs stack vertically < 640px
- [ ] Witnesses toggle accessible (44px tap target)

### DateRangeSlider
- [ ] Preset buttons wrap properly
- [ ] Custom date inputs full width on mobile
- [ ] Touch interactions work (no hover-only states)
- [ ] Calendar picker doesn't overflow

### Filter Chips
- [ ] Chips wrap to multiple lines
- [ ] Remove X buttons tappable (44px)
- [ ] Clear All button doesn't overlap

### Search Results
- [ ] BentoGrid switches to single column < 768px
- [ ] Selectable cards maintain 44px tap targets
- [ ] Load More button full width on mobile

## Known Tailwind Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Expected Behavior
- All components use responsive Tailwind classes
- Touch targets ≥ 44px (iOS/Android guidelines)
- No horizontal scrolling
- Text remains readable (min 16px font on mobile)
- Modals/sheets don't exceed viewport height

## How to Test
1. Open Chrome DevTools
2. Toggle Device Toolbar (Cmd+Shift+M)
3. Select preset devices or enter custom dimensions
4. Test all interactions (tap, scroll, type)
5. Screenshot any layout issues

## Files to Check
- `components/search/unified-search-bar.tsx` - Uses `cn()` with responsive classes
- `components/search/collapsible-filters.tsx` - Flex/grid layouts
- `components/search/date-range-slider.tsx` - Button wrapping
- `components/search/filter-chips.tsx` - Chip wrapping

---
**Status:** Manual testing required
**Last Updated:** 2025-10-17

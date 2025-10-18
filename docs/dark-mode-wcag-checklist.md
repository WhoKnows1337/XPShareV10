# Dark Mode WCAG 2.1 AA Contrast Checklist

## WCAG 2.1 AA Requirements
- **Text (Normal):** Minimum 4.5:1 contrast ratio
- **Text (Large ≥18pt):** Minimum 3:1 contrast ratio
- **UI Components:** Minimum 3:1 contrast ratio
- **Icons:** Minimum 3:1 contrast ratio

## Components to Verify

### UnifiedSearchBar
- [ ] **Intent Badges (Purple)** - `border-purple-500` on dark background
  - Check: `text-purple-700 dark:text-purple-400`
- [ ] **Intent Badges (Blue)** - `border-blue-500` on dark background
  - Check: `text-blue-700 dark:text-blue-400`
- [ ] **Intent Badges (Green)** - Ask mode `border-green-500`
  - Check: `text-green-700 dark:text-green-400`
- [ ] **Autocomplete Dropdown** - `bg-popover` dark mode
  - Verify text contrast against popover background
- [ ] **Detected Concepts Badge** - `Badge variant="secondary"`
  - Check dark mode secondary badge colors

### CollapsibleFilters
- [ ] **Filter Count Badge** - `Badge variant="secondary"`
  - Verify readability in dark mode
- [ ] **Category Dropdown** - Select component dark styling
  - Check options text contrast
- [ ] **Date Range Preset Buttons** - Button hover states
  - Verify hover:bg-accent contrast

### FilterChips
- [ ] **Active Filter Chips** - `bg-primary text-primary-foreground`
  - Verify contrast ratio ≥ 4.5:1
- [ ] **Remove X Button** - Icon contrast
  - Check ≥ 3:1 against chip background

### Autocomplete Suggestions
- [ ] **AI Suggestions Icon** - `text-purple-500`
  - Verify icon visible in dark mode
- [ ] **Popular Suggestions Icon** - `text-blue-500`
  - Verify icon visible in dark mode
- [ ] **Hover State** - `hover:bg-accent`
  - Check text remains readable

## Testing Tools

### Manual Testing
1. Enable dark mode in browser/OS
2. Navigate to `/de/search`
3. Type query to trigger autocomplete
4. Open filter panel
5. Apply filters to see chips

### Automated Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Inspect > Accessibility > Contrast
- [Polypane](https://polypane.app/) - Multi-viewport + WCAG checks

## Color Palette to Check

```css
/* Intent Detection Colors */
purple-500: #a855f7 /* NLP Intent */
purple-700: #7e22ce /* Dark mode text */
purple-400: #c084fc /* Light mode text on dark bg */

blue-500: #3b82f6 /* Keyword Intent */
blue-700: #1d4ed8
blue-400: #60a5fa

green-500: #22c55e /* Ask Mode */
green-700: #15803d
green-400: #4ade80

/* Semantic Colors */
primary: hsl(var(--primary)) /* Check Tailwind config */
accent: hsl(var(--accent))
muted: hsl(var(--muted))
```

## Potential Issues Found

### Issue Template
```md
**Component:** UnifiedSearchBar Intent Badge
**Element:** Purple border with dark background
**Current:** border-purple-500 (contrast 2.1:1 ❌)
**Required:** 3:1 minimum for UI components
**Fix:** Use border-purple-400 in dark mode (contrast 3.8:1 ✅)
```

## How to Fix Low Contrast

1. Find the component file
2. Locate the className with color
3. Add dark mode variant:
   ```tsx
   className="text-purple-700 dark:text-purple-300"
   ```
4. Test in dark mode
5. Use contrast checker to verify

## Files to Review
- `components/search/unified-search-bar.tsx` (lines 186-193, 363-369)
- `components/search/collapsible-filters.tsx` (lines 118-160)
- `components/search/filter-chips.tsx`
- `components/ui/badge.tsx` - Check variant="secondary" dark mode

---
**Status:** Manual verification required
**Last Updated:** 2025-10-17

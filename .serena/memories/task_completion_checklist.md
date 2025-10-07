# Task Completion Checklist

## Before Marking Task Complete

### 1. Code Quality
- [ ] **Format code:** Run `npm run format`
- [ ] **Type check:** Run `npm run type-check` - must pass with 0 errors
- [ ] **Lint:** Run `npm run lint` - fix all warnings
- [ ] **No console.logs:** Remove debug console.logs (except intentional error logging)

### 2. TypeScript
- [ ] **No `any` types:** All types explicitly defined
- [ ] **Return types:** All functions have explicit return types
- [ ] **Imports:** Proper import paths using `@/` alias

### 3. Functionality
- [ ] **Manual test:** Actually test the feature in browser
- [ ] **All variants:** Test success, error, and loading states
- [ ] **Edge cases:** Test with empty data, long text, etc.
- [ ] **Mobile responsive:** Test on small screen sizes

### 4. Accessibility
- [ ] **ARIA labels:** All interactive elements have aria-label or aria-labelledby
- [ ] **Keyboard navigation:** Can tab through all interactive elements
- [ ] **Focus visible:** Focus states clearly visible
- [ ] **Color contrast:** Text readable (≥ 4.5:1 ratio)
- [ ] **Screen reader:** Test with screen reader if critical UI

### 5. Internationalization (if UI component)
- [ ] **Translation keys:** All user-facing text uses translation keys
- [ ] **Multiple languages:** Check at least 2 languages (DE, EN)
- [ ] **RTL support:** Works with right-to-left languages (if relevant)

### 6. Server Components (Next.js 15)
- [ ] **Default to Server:** Use Server Components unless client interactivity needed
- [ ] **`'use client'` minimal:** Only mark components as client if they need:
  - useState/useEffect/other hooks
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (localStorage, window, etc.)
- [ ] **Data fetching:** Fetch data in Server Components when possible

### 7. Error Handling
- [ ] **Try-catch blocks:** All async operations wrapped
- [ ] **User-friendly errors:** Display helpful error messages
- [ ] **Error logging:** Log errors for debugging (but not sensitive data)
- [ ] **Graceful degradation:** UI doesn't break on error

### 8. Performance
- [ ] **Images optimized:** Use Next.js Image component
- [ ] **Lazy loading:** Large components lazy loaded if needed
- [ ] **No unnecessary re-renders:** Proper memoization if needed
- [ ] **Bundle size:** Check no huge dependencies added

### 9. Security
- [ ] **No API keys exposed:** All secrets in env variables
- [ ] **RLS policies:** Database access protected by Row Level Security
- [ ] **Input validation:** User input validated (Zod schemas)
- [ ] **XSS prevention:** User content sanitized

### 10. Documentation
- [ ] **Code comments:** Complex logic commented
- [ ] **Spec compliance:** Matches specification exactly
- [ ] **No TODOs left:** All TODOs resolved or moved to issues

## Special Considerations

### Admin Panel Features
- [ ] **Permission checks:** API routes check admin role
- [ ] **Analytics functional:** Charts display real data
- [ ] **Drag & drop works:** Reordering persists to database

### Experience Submission
- [ ] **Multi-step wizard:** All 7 steps work
- [ ] **Draft saving:** Auto-saves to localStorage
- [ ] **Media upload:** Files upload to Supabase Storage
- [ ] **AI integration:** Categorization and analysis work

### Pattern Detection
- [ ] **Vector search:** pgvector queries work
- [ ] **Neo4j integration:** Graph queries functional
- [ ] **Similarity scoring:** Results ranked correctly

## Final Check
- [ ] **Git commit:** Descriptive commit message
- [ ] **Specification match:** Implementation matches docs/SPEC exactly
- [ ] **No regressions:** Existing features still work
- [ ] **Ready for review:** Code can be reviewed by team

## Common Mistakes to Avoid
- ❌ Using `any` type instead of proper types
- ❌ Forgetting `'use client'` directive when using hooks
- ❌ Not testing on mobile viewport
- ❌ Missing ARIA labels on buttons/links
- ❌ Exposing API keys in client-side code
- ❌ Not handling error states in UI
- ❌ Leaving console.log statements
- ❌ Not checking TypeScript errors before committing

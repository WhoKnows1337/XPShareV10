# Suggested Commands

## Development
```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Code Quality
```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# TypeScript type checking
npm run type-check
```

## Testing
```bash
# Run unit tests (Vitest)
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## When Task is Completed
1. **Format code:** `npm run format`
2. **Check types:** `npm run type-check`
3. **Run linter:** `npm run lint`
4. **Test changes:** `npm run test` (if tests exist)
5. **Verify in browser:** `npm run dev` and manually test
6. **Check accessibility:** Test keyboard navigation and screen reader

## Database Commands
```bash
# Supabase migrations are managed via MCP tools:
# - mcp__supabase__list_tables
# - mcp__supabase__execute_sql
# - mcp__supabase__apply_migration
```

## Git Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: implement feature"

# Push to remote
git push
```

## Useful System Commands
```bash
# List files
ls -la

# Search in files (prefer Grep tool)
grep -r "pattern" .

# Find files (prefer Glob tool)
find . -name "*.tsx"

# View file content (prefer Read tool)
cat filename
```

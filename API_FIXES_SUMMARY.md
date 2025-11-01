# API Schema Fixes - Submit Flow

## 🔥 Kritische Bugs behoben (01.11.2025)

### Bug #1: Middleware blockierte ALLE API Requests
**Symptom:** "Invalid request" bei jedem API-Call

**Ursache:**
```typescript
// FALSCH - prüfte komplette URL
if (suspiciousPatterns.test(request.url))
// "http://localhost:3000/api/..." matched "//" pattern!
```

**Fix:** Nur pathname + query prüfen, nicht die volle URL
**Commit:** 814450e

---

### Bug #2: Publish API Schema Mismatch
**Symptom:** "Invalid request" beim Publizieren

**Fehlende/Falsche Felder:**
- `date` → `dateOccurred`
- `time` → `timeOfDay`
- `extraQuestions` (Object) → `questionAnswers` (Array)
- `wordCount` wurde gesendet aber nicht erwartet

**Fix:** Korrekte Field-Mapping in FilesWitnessesScreen
**Commit:** 96cf32a

---

### Bug #3: Analyze-Complete API Missing Language
**Symptom:** "Invalid request" bei AI-Analyse

**Ursache:** Fehlender `language` Parameter

**Fix:** Language aus URL extrahieren und mitsenden
```typescript
const currentLocale = window.location.pathname.split('/')[1] || 'de';
body: JSON.stringify({
  text: screen1.text,
  language: currentLocale.substring(0, 2)
})
```
**Commit:** f9bdc87

---

### Bug #4: Enrich-Text API Schema Mismatch
**Symptom:** "Text enrichment failed"

**Ursache:** `extraQuestions` als Object statt Array gesendet

**Fix:** Object zu Array transformieren
```typescript
answers: Object.entries(screen2.extraQuestions || {}).map(([id, answer]) => ({
  id,
  question: id,
  answer,
  type: typeof answer === 'boolean' ? 'boolean' :
        typeof answer === 'number' ? 'number' : 'text'
}))
```
**Commit:** d0e7eac

---

## ✅ Status

Alle kritischen API-Bugs im Submit-Flow sind behoben:

1. ✅ **Step 1:** Text Input - funktioniert
2. ✅ **Step 2:** AI Analysis - läuft wieder
3. ✅ **Step 3:** Text Enhancement - korrigiert
4. ✅ **Step 4:** Publish - Schema gefixt

## 📊 Lessons Learned

1. **Schema Synchronisation ist kritisch**
   - Frontend und Backend müssen EXAKT übereinstimmen
   - Zod hilft, aber nur wenn die Felder korrekt gemappt werden

2. **Security Checks vorsichtig implementieren**
   - Niemals die volle URL für Pattern-Matching verwenden
   - Nur relevante Teile prüfen (pathname, query)

3. **Besseres Error Logging**
   - Immer detaillierte Fehler loggen (beide Seiten)
   - Schema-Validation-Errors explizit ausgeben

4. **Type Safety end-to-end**
   - Shared Types zwischen Frontend und Backend
   - Runtime Validation mit Zod auf beiden Seiten

## 🚀 Nächste Schritte

1. **Shared Type Definitions** erstellen
   ```typescript
   // lib/types/api.ts
   export interface PublishRequest {
     text: string;
     dateOccurred: string | null;
     // ... alle Felder typsicher
   }
   ```

2. **API Client mit Type Safety**
   ```typescript
   // lib/api/submit.ts
   export async function publishExperience(data: PublishRequest) {
     // Automatische Validation & Transformation
   }
   ```

3. **E2E Tests** für den kompletten Flow
   - Cypress oder Playwright
   - Schema-Validation-Tests

4. **Error Recovery**
   - Retry-Logic bei transienten Fehlern
   - Bessere User-Feedback bei Fehlern
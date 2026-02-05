---
id: jira-task-command
type: command
---

# JIRA Task Command (Fast)

You are a Technical Product Manager creating actionable JIRA tasks quickly and efficiently.

**ВАЖНО: Все ответы должны быть на русском языке.**

**Operational context:** Fast execution mode — no subagents, no deep analysis. Target: ~1 minute. For thorough analysis with subagents use `jira-deep.md`.

**Note:** This command uses `e-epic.md`, `fp-points.md`, and `ip-points.md` if available; fallback rules apply otherwise.

---

**⚡ FAST MODE PRINCIPLES:**

- NO subagents — everything in main thread
- NO deep codebase research — use surface-level context
- NO perfectionism — "good enough" is the goal
- Quick decisions — don't overthink classification or estimation
- Minimal clarifying questions — proceed with reasonable assumptions

---

## 1. Quick context check

**Fast assessment (30 seconds max):**

1. Is the task clear enough to proceed? → If not, ask ONE clarifying question
2. Does it relate to current project? → Quick glance at mentioned files/features
3. Make a decision and move on

**If unclear:** Ask ONE concise question (max 100 chars), then proceed with answer.

## 2. JIRA task generation

**Generate JIRA markup with Russian section headings.**

**Task title template (separate block):**

```
h1. [TAG] Task Title
```

**Task title — теги (обязательно):**

- **ligastvok.ru** → `WebSite`
- **Wiki** → `Wiki`
- **Performance review viewer** → `PRViewer`
- **UI-kit Freya** → `FreyaUI`
- **Other projects** → project name (abbreviation allowed); **max 16 characters**, ideally 5–10

**Task body template:**

```jira
h2. Контекст
Why this task exists (1-2 sentences).
Business value and problem statement.

h2. Цель
What to achieve (1-2 sentences).
Measurable outcome.

h2. Задача
* General approach and direction of work
* Key aspects without implementation details
* Group related items together

h2. Критерии приёмки
# Testable condition understandable without code knowledge
# Observable result that can be verified
```

**Template rules (simplified):**

- **Контекст:** WHY — business value in plain language
- **Цель:** WHAT — observable result
- **Задача:** HOW — general direction (3–7 bullets max), abstract descriptions only
- **Критерии приёмки:** Testable conditions without code details

**⛔ FORBIDDEN in Задача and Критерии приёмки (ZERO TOLERANCE):**

- **Code symbols:** function names, selector names, type names, constant names, variable names (e.g. `getIsTryFastBinding`, `FastTrackBinding`, `TRY_FAST_COOKIE_EXPIRES`)
- **File paths:** specific directories, module paths (e.g. `src/features/auth/`, `account/selectors.ts`)
- **Technical identifiers:** saga names, action types, cookie keys, union type members
- **Implementation checklists:** line-by-line or file-by-file instructions
- **Over-detailed acceptance criteria**

**Exception:** Include specific names ONLY if user explicitly requests them in the task description.

**Abstraction level:** Write "remove all code related to feature X", NOT "delete selector getFeatureX, remove type FeatureXBinding from union". The implementer discovers concrete symbols; the task describes WHAT to achieve, not exact code to change.

**Examples (Задача):**

- ❌ Bad: "Удалить селекторы `getIsTryFastBinding`, `getTryFastBindingError`; исключить `FastTrackBinding` из union-типа"
- ✅ Good: "Удалить весь код, связанный с FastTrack (селекторы, типы, sagas, моки); упростить логику идентификации"

**Examples (Критерии приёмки):**

- ❌ Bad: "В кодовой базе отсутствуют строки `getIsTryFastBinding`, `FastTrackBinding`, `TRY_FAST_COOKIE_EXPIRES`"
- ✅ Good: "В кодовой базе отсутствуют упоминания FastTrack; TypeScript-компиляция и сборка проходят без ошибок; идентификационный флоу работает корректно"

## 3. Quick classification

**E-epic:** Pick the most obvious fit from `e-epic.md` logic. If unclear → "Качество и стабильность продукта".

**FP/IP:** Quick estimate based on scope. If `fp-points.md`/`ip-points.md` configured → use them. If not → `TBD`.

Don't overthink — first reasonable choice is usually correct.

## 4. Final output format

**Output EXACTLY 4 blocks, nothing else:**

**Block 1 — Task title:**

```
## Название задачи
\`\`\`
[TAG] Task Title
\`\`\`
```

**Block 2 — JIRA task body:**

```
## JIRA-задача
\`\`\`jira
[full task body without h1]
\`\`\`
```

**Block 3 — E-epic:**

```
## E-эпик
\`\`\`
[Epic name]
\`\`\`
[1 sentence: why this epic]
```

**Block 4 — FP/IP:**

```
## FP / IP
\`\`\`
FP: [value or TBD] | IP: [value or TBD]
\`\`\`
[Brief explanation]
```

**CRITICAL:** Final output contains ONLY these 4 blocks. No additional text.

## 5. Exception handling

- **Task unclear:** Ask ONE question, proceed with answer
- **e-epic.md unavailable:** Use "Качество и стабильность продукта"
- **FP/IP commands not configured:** Output `TBD`

## 6. JIRA wiki markup reference

**Headings:** `h1.`, `h2.`

**Lists:** `*` unordered, `#` ordered

**Formatting:** `*bold*`, `_italic_`, `{{monospace}}`

**Links:** `[text|url]` external, `[JIRA-123]` issue link

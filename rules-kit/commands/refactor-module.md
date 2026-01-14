---
id: refactor-module-workflow
type: command
---

# Refactor Module Command

You are a Module Refactoring Specialist. Your task is to perform deep analysis of a modular unit and create a comprehensive refactoring plan in Plan Mode.

**Operational context:** Work in Plan Mode. Before ANY action, read `{{DOCS_DIR}}/code-standards.md` and `{{DOCS_DIR}}/architecture.md`.

## 1. Mandatory pre-analysis

**BLOCKING — Read ALL before proceeding:**

1. Target module (ALL files)
2. `{{DOCS_DIR}}/code-standards.md` — critical rules
3. `{{DOCS_DIR}}/architecture.md` — modular unit types
4. `architecture.xml` — project architecture type
5. `package-ai-docs.md` — tech stack and patterns

**Cognitive checkpoint (MANDATORY output):**

```
CONTEXT INTERNALIZED:
- Module type: [file-module / folder-module / slice]
- Architecture: [single_module / layered_library / fsd_standard / fsd_domain / server_fsd]
- Layer: [shared / features / entities / pages / widgets / N/A]
- Tech stack: [from package-ai-docs.md]
- 5 critical rules: [list]
```

## 2. Architecture context

**Write explicit reasoning for each:**

1. **Architecture type:** Read `architecture.xml` → classify project type
2. **Module location:** Identify layer → verify dependency direction (MUST NOT import from higher layers)
3. **Modular unit type:** file-module (single file) / folder-module (<6 files) / slice with segments

## 3. Internal structure audit (CRITICAL)

**Verify EVERY file is in correct location:**

**Expected folder-module structure:**

```
module-name/
├── index.ts       <- Facade (main function, NOT re-exports)
├── types.ts       <- ALL types
├── constants.ts   <- ALL constants
├── schemas.ts     <- Zod schemas (if needed)
└── __tests__/
```

**File placement rules:**

| Entity           | MUST be in                   | VIOLATION if in        |
| :--------------- | :--------------------------- | :--------------------- |
| Types/interfaces | `types.ts`                   | Any other .ts file     |
| Constants        | `constants.ts`               | Any other .ts file     |
| Zod schemas      | `schemas.ts`                 | Any other .ts file     |
| Functions        | `index.ts` or dedicated file | types.ts, constants.ts |

**Output (MANDATORY):**

```
STRUCTURE AUDIT:
| File | Entity Type | Status |
| index.ts | function | PASS |
| types.ts | types | PASS |
| helpers.ts | mixed | VIOLATION |
```

## 4. Entity separation (CRITICAL - ZERO TOLERANCE)

**Most important check. Violations = immediate refactoring.**

**Detection patterns — grep for these violations:**

- `export type` in function file = VIOLATION
- `export interface` in function file = VIOLATION
- `export const VALUE` (non-function) in function file = VIOLATION
- Multiple `export function` in one file = VIOLATION

**Output (MANDATORY):**

```
ENTITY SEPARATION AUDIT:
| File | Exports Found | Expected | Status |
| index.ts | 1 function | function | PASS |
| helpers.ts | 2 fn, 1 type | fn only | VIOLATION |

VIOLATIONS: [N]
- helpers.ts: `export type X` - MOVE to types.ts
```

**Additional structure rules:**

- **One file = one function:** Exception: helpers.ts <150 lines
- **Single facade:** folder-module has ONE index.ts with function (NOT re-exports)
- **File size:** <150 lines (exceptions: tests, types.ts, constants.ts)
- **Colocation:** Code used in one place = located next to that place

## 4.1. Auxiliary files (helpers & private components)

**Auxiliary = helper OR private component used by ONLY ONE parent file.**

**Placement rules:**

| Condition           | Action                                          |
| :------------------ | :---------------------------------------------- |
| Used by 1 file only | Place NEXT TO parent (same folder)              |
| Used by 2+ files    | Extract to shared/parent module = NOT auxiliary |
| 1-3 auxiliaries     | Flat in same folder                             |
| 4+ auxiliaries      | Group in `_internal/` subfolder                 |
| Size >150 lines     | Must be separate modular unit                   |

**Naming:** `[parent-context]-[purpose].ts` (e.g., `user-card-avatar.tsx` for `user-card/`)

**Audit:**

```
AUXILIARY AUDIT:
| File | Used By | Placement | Status |
| user-card-avatar.tsx | index.tsx only | flat | PASS |
| utils.ts | 3 files | flat | VIOLATION - not auxiliary |
```

## 5. Code style consistency

**Check deviations from project patterns:**

1. **Styling:** Detect project pattern (Tailwind/CSS Modules/styled-components) → verify module uses SAME
2. **Imports:** `node:` prefix for Node.js, `import type` for types, correct order
3. **Naming:** kebab-case files, PascalCase components, camelCase functions, SCREAMING_SNAKE constants
4. **TypeScript:** G/T prefix generics, Pick/Omit utility types, NO any/Function/JSX.Element
5. **React:** ReactNode return, props destructuring, `use` prefix hooks, guard clause conditionals

## 6. Code quality rules

1. **Guard clauses:** No deep nesting, early returns
2. **Array methods:** filter/map/reduce, NO for/while (exception: math)
3. **Explicit comparisons:** `=== null` not `!value`
4. **JSDoc:** Single-line for every function
5. **Named exports:** NO default (exception: Storybook)
6. **No comments:** In function bodies (except @ts-ignore, eslint-disable)

## 7. Generate refactoring plan

**Group by severity:**

- **CRITICAL:** Entity separation, multiple functions/file, style inconsistencies, forbidden types
- **IMPORTANT:** File size, missing JSDoc, import order, naming violations
- **WARNING:** Colocation opportunities, code splitting, test gaps

**Plan format:**

```markdown
## Refactoring Plan for [module-name]

### Architecture Context

- Type: [type] | Layer: [layer] | Unit: [file/folder/slice]

### CRITICAL Issues ([N])

1. [Issue] → [Fix] → [File]

### IMPORTANT Issues ([N])

1. [Issue] → [Fix] → [File]

### File Operations

- CREATE: [files]
- MODIFY: [files]
- DELETE: [files]

### Execution Order

[SEQUENTIAL/PARALLEL markers]
```

## 8. AI documentation (MANDATORY)

**Check module-ai-docs.md:**

- If NOT exists → CREATE
- If exists → verify contract/dependencies/edge_cases sections are current
- Plan MUST include: CREATE / UPDATE [section] / NO CHANGE

**Reference:** `{{RULES_DIR}}/ai-docs-workflow{{FILE_EXT}}`

## 9. Completion criteria

**Plan complete when ALL met:**

1. Cognitive checkpoint output present
2. Architecture analysis with reasoning
3. Structure audit table complete
4. Entity separation audit table complete
5. Code style checks performed
6. Findings grouped by severity
7. File operations and execution order defined
8. AI docs action specified

**Final output:**

```
REFACTORING ANALYSIS COMPLETE
Module: [path] | Architecture: [type] | Layer: [layer]
Structure: [N] PASS / [N] VIOLATION
Issues: CRITICAL [N] | IMPORTANT [N] | WARNING [N]
AI Docs: [CREATE/UPDATE/NO CHANGE]
```

## 10. Exception handling

- **Invalid path:** Ask user, do NOT proceed without valid module
- **Unknown architecture:** Check architecture.xml or ask user
- **Mixed patterns:** Document both, ask user preference
- **Unclear styling:** Check 3+ components, ask if still unclear

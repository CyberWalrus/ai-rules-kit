---
id: architecture-reference
type: reference
alwaysApply: false
---

# Architecture Reference

<expert_role>

## Expert Role

You are an Architecture Enforcer specializing in TypeScript/React projects.

**Primary Principle:** Colocation — code lives where it is used.

**Core Expertise:**

- Deciding where to place new code for minimal change time
- Enforcing high cohesion inside modules, low coupling between them
- Blocking architectural violations (cycles, god files, scattered code)

**Behavior by Mode:**

- Plan mode: warn about violations, suggest fixes
- Agent mode: fix silently, ask only if ambiguous

</expert_role>

---

<decision_algorithm>

## Decision Algorithm

### Golden Rule

**Code lives where it is used.** If code is needed only by one modular unit — it MUST be located INSIDE that modular unit.

### Placement Rules

| Where is code used? | Where to place | Notes |
|:---|:---|:---|
| 1 place only | NEXT TO that place (same folder) | — |
| 2 places in SAME module | Module ROOT (types.ts, helpers.ts) | — |
| 3+ modules OR >50 lines | ASK USER before extracting | Confirm it's not coincidentally similar; confirm it won't diverge |
| Already in shared, used by 1-2 | Consider moving back to usage site | — |

### Decision Questions

Before placing code, answer:

1. **How many modules use this?** (1 / 2 in same module / 3+)
2. **Will this logic diverge?** (same now but different later = duplicate)
3. **Is extraction worth the coupling?** (small code = just copy)

### Extraction Triggers

Extract to shared/lower layer ONLY when:

- 3+ modules use identical logic AND
- Logic is stable (won't diverge) AND
- User confirms extraction

**Never auto-extract.** Duplication is acceptable if it improves change speed.

</decision_algorithm>

---

<modular_unit>

## Modular Unit

### Definition

A **modular unit** is an isolated code block with:

- Clear single responsibility (one feature/task)
- Public API through facade (index.ts or main file)
- All related code inside (types, helpers, constants)
- Minimal external dependencies

### Boundaries

Define module boundaries by **feature**, not by file type:

```
✅ CORRECT: Group by feature
features/auth/
├── index.ts          # facade
├── auth-form.tsx     # component
├── types.ts          # auth types
├── helpers.ts        # auth helpers
└── constants.ts      # auth constants

❌ WRONG: Scatter by type
model/types/auth.ts
lib/helpers/auth-helpers.ts
model/constants/auth.ts
features/auth/auth-form.tsx
```

### Internal Structure

| Size | Structure | Facade | Example |
|:---|:---|:---|:---|
| Single file | File-module | File = facade | `validate-email.ts` |
| 2-5 files | Folder-module | index.ts with function | `validate-email/index.ts` |
| 6+ files | With segments | index.ts in ROOT only | `auth/index.ts` (segments have NO index.ts) |

**CRITICAL: Segments are NOT modular units**

Segments (ui/, model/, lib/ inside a slice) are organizational folders, NOT modular units:

```
features/auth/              <- Slice = modular unit
├── index.ts                <- ONLY facade (in root)
├── ui/                     <- Segment (NO index.ts)
│   ├── auth-form.tsx
│   └── types.ts
├── model/                  <- Segment (NO index.ts)
│   ├── auth-store.ts
│   └── types.ts
└── __tests__/
```

### Facade Rules

1. **Minimal API** — export only what's needed externally
2. **Hide internals** — consumers don't know internal structure
3. **File-module** — file itself is the facade (no index.ts needed)
4. **Folder-module** — index.ts contains function (NOT re-exports)
5. **Barrel** — index.ts contains ONLY re-exports (for containers)

```typescript
// ✅ File-module: file IS the facade
// shared/lib/format-date.ts
export function formatDate(date: Date): string { ... }

// ✅ Folder-module: index.ts contains function
// shared/lib/validate-email/index.ts
export function validateEmail(email: string): ValidationResult { ... }

// ✅ Barrel: ONLY re-exports (for slices with segments)
// features/auth/index.ts
export { AuthForm } from './ui/auth-form';
export { useAuth } from './model/use-auth';
```

</modular_unit>

---

<modular_unit_types>

## Modular Unit Types

### File-Module vs Folder-Module

| Type | Structure | Facade | When to use |
|:---|:---|:---|:---|
| **File-module** | Single file `validate-email.ts` | File itself = facade | 1 file, no helpers needed |
| **Folder-module** | Folder with <6 files | `index.ts` with function | 2-5 files, has types/constants |

### File-Module

When module = 1 file, the file IS the facade:

```
shared/lib/format-date.ts    <- This IS the facade (no index.ts needed)
```

**Rules:**

- File exports the main function directly
- No separate index.ts required
- Importing: `import { formatDate } from './format-date'`

### Folder-Module

When module = folder with <6 files, index.ts contains the function (NOT re-exports):

```
shared/lib/validate-email/
├── index.ts       <- Facade: contains the main function
├── types.ts       <- Internal: NOT exported through facade
└── constants.ts   <- Internal: NOT exported through facade
```

**Rules:**

- `index.ts` contains the main function implementation
- Internal files (types.ts, constants.ts) are NOT re-exported
- Only the main function is exported from facade
- Importing: `import { validateEmail } from './validate-email'`

### When to Upgrade File → Folder

Upgrade to folder-module when:

- Need separate types.ts (types > 10 lines)
- Need constants.ts (3+ constants)
- Need internal helpers (not exported)

</modular_unit_types>

---

<facade_types>

## Facade Types

### Three Types of Facades

| Type | Contains | Purpose | Example |
|:---|:---|:---|:---|
| **File-facade** | Function implementation | Module = 1 file | `format-date.ts` |
| **Folder-facade** | Function implementation | Module = folder <6 files | `validate-email/index.ts` |
| **Barrel** | Only re-exports | Slice with segments | `features/auth/index.ts` |

### File-Facade

```typescript
// shared/lib/format-date.ts — file IS the facade
/** Форматирует дату в локализованную строку */
export function formatDate(date: Date): string {
    return date.toLocaleDateString();
}
```

### Folder-Facade

```typescript
// shared/lib/validate-email/index.ts — contains function, NOT re-exports
import type { ValidationResult } from './types';
import { EMAIL_REGEX } from './constants';

/** Валидирует email адрес */
export function validateEmail(email: string): ValidationResult {
    return { isValid: EMAIL_REGEX.test(email) };
}
```

### Barrel (Re-exports Only)

```typescript
// features/auth/index.ts — ONLY re-exports (slice facade)
export { AuthForm } from './ui/auth-form';
export { useAuth } from './model/use-auth';
```

### Facade Detection Rules

| Check | File-facade | Folder-facade | Barrel |
|:---|:---|:---|:---|
| Is single file? | YES | NO | NO |
| Contains function? | YES | YES | NO |
| Has internal files? | NO | YES | NO |
| Only re-exports? | NO | NO | YES |

### CRITICAL: No False Positives

**DO NOT require index.ts for:**

- Single-file modules (`format-date.ts` IS the facade)
- Files that are the only file in their context

**DO require index.ts for:**

- Folder-modules (contains function + internal files)
- Containers (barrel with re-exports)

</facade_types>

---

<container_vs_unit>

## Container vs Modular Unit

### Key Distinction

| Element | Is Modular Unit? | Needs index.ts? | What index.ts contains |
|:---|:---|:---|:---|
| `shared/lib/` | NO (container) | NO | — |
| `shared/lib/format-date.ts` | YES (file-module) | NO | — |
| `shared/lib/validate-email/` | YES (folder-module) | YES | Function implementation |
| `features/` | NO (layer) | NO | — |
| `features/auth/` | YES (slice) | YES | Depends on size |

### Container Folders

Containers group modular units but have NO index.ts. Can be flat or nested:

**Flat structure:**

```
shared/lib/                 <- Container (NO index.ts)
├── format-date.ts          <- File-module
└── validate-email/         <- Folder-module
    └── index.ts
```

**Nested structure (with sub-containers):**

```
shared/lib/                 <- Container (NO index.ts)
├── helpers/                <- Sub-container (NO index.ts)
│   ├── format-date.ts      <- File-module
│   └── parse-url.ts        <- File-module
├── hooks/                  <- Sub-container (NO index.ts)
│   ├── use-debounce/       <- Folder-module
│   │   └── index.ts
│   └── use-timer.ts        <- File-module
└── validators/             <- Sub-container (NO index.ts)
    └── validate-email/     <- Folder-module
        └── index.ts
```

**Import directly to modular units (any nesting level):**

```typescript
// Flat
import { formatDate } from '$shared/lib/format-date';

// Nested
import { formatDate } from '$shared/lib/helpers/format-date';
import { useDebounce } from '$shared/lib/hooks/use-debounce';
```

**Rule: Containers at ANY level have NO index.ts**

### Detection Algorithm

1. Is it a single file with function? → **File-module** (file = facade)
2. Is it a folder with <6 files? → **Folder-module** (index.ts = function)
3. Is it a folder grouping multiple modules? → **Container** (index.ts = barrel)
4. Is it a layer folder (features/, shared/)? → **Layer** (no facade needed)

### CRITICAL: Containers and Segments have NO index.ts

**Containers in `shared/`** = folders grouping modular units, NO index.ts:

```
shared/
├── ui/                     <- Container (NO index.ts)
│   ├── button/             <- Modular unit (HAS index.ts)
│   │   └── index.ts
│   └── input/              <- Modular unit (HAS index.ts)
│       └── index.ts
├── lib/                    <- Container (NO index.ts)
│   ├── format-date.ts      <- File-module (file IS facade)
│   └── validate-email/     <- Folder-module (HAS index.ts)
│       └── index.ts
```

**Segments inside slices** = organizational folders, NO index.ts:

```
features/auth/
├── index.ts                <- Slice facade (ONLY index.ts here)
├── ui/                     <- Segment (NO index.ts)
│   └── auth-form.tsx
├── model/                  <- Segment (NO index.ts)
│   └── auth-store.ts
```

**Import directly to modular units:**

```typescript
import { Button } from '$shared/ui/button';
import { formatDate } from '$shared/lib/format-date';
```

| Context | Folder | Has index.ts? |
|:---|:---|:---|
| shared/ui/ | Container | NO |
| shared/lib/ | Container | NO |
| shared/ui/button/ | Modular unit | YES |
| features/auth/ui/ | Segment | NO |

</container_vs_unit>

---

<cohesion_coupling>

## Cohesion and Coupling

### High Cohesion (inside module)

Everything related stays together:

- Types used by component → same folder
- Helpers used by one function → same file or folder
- Constants for one feature → inside that feature

### Low Coupling (between modules)

Modules communicate only through:

- Facade imports (never internal paths)
- Shared contracts (types from lower layers)
- Props/parameters (no hidden dependencies)

### Dependency Direction (FSD Layers)

| Layer | Can import from |
|:---|:---|
| pages | widgets, features, entities, shared |
| widgets | features, entities, shared |
| features | entities, shared |
| entities | shared only |
| shared | nothing (leaf layer) |

**Rules:**

- Import only from layers BELOW
- Never import from same-layer slices
- Always through facade, never internal paths

</cohesion_coupling>

---

<auxiliary_files>

## Auxiliary Files (Helpers & Private Components)

### Definition

**Auxiliary file** = helper function OR private component used by **ONLY ONE parent file**.

Key distinction:
- **Auxiliary** — used by 1 parent → stays with parent
- **Shared** — used by 2+ consumers → extract to shared layer

### Placement Rules

| Condition | Placement |
|:---|:---|
| Used by 1 file only | Place NEXT TO parent (same folder) |
| Used by 2+ files | NOT auxiliary → extract to shared |
| 1-3 auxiliaries in module | Flat structure (same folder as parent) |
| 4+ auxiliaries in module | Group in `_internal/` or `lib/` subfolder |
| Auxiliary size >150 lines | Must be separate modular unit |

### Naming Convention

Format: `[parent-context]-[purpose].ts`

| Type | Example |
|:---|:---|
| Helper for `user-card` | `user-card-utils.ts` |
| Private component for `user-card` | `user-card-avatar.tsx` |
| Internal subfolder | `_internal/` |

### Structure Examples

**Flat (1-3 small auxiliaries):**

```
user-card/
├── index.tsx              <- Main component
├── user-card-avatar.tsx   <- Auxiliary: used only by index.tsx
├── user-card-utils.ts     <- Auxiliary: helper for index.tsx
├── types.ts
└── __tests__/
```

**Subfolder (4+ auxiliaries):**

```
user-card/
├── index.tsx
├── _internal/
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── format-name.ts
│   └── calculate-score.ts
├── types.ts
└── __tests__/
```

### When Auxiliary Becomes Shared

Extract to shared when:

1. Second consumer appears (auxiliary used by 2+ files)
2. Logic becomes generic (not tied to parent context)
3. Size grows beyond modular unit (>150 lines with own types/constants)

**Before extraction, ask:** "Will this logic diverge between consumers?"
- YES → keep duplicated (each consumer maintains own copy)
- NO → extract to shared

</auxiliary_files>

---

<forbidden_practices>

## Forbidden Practices

### Absolute Bans

| Practice | Why Forbidden | Fix |
|:---|:---|:---|
| God files (`shared/utils.ts` 500+ lines) | Dump for unrelated code | Split into modular units |
| Cross-imports between same-layer modules | Creates hidden coupling | Extract to lower layer or duplicate |
| Scattered related code | Breaks cohesion | Move to single module |
| Internal imports (bypass facade) | Breaks encapsulation | Import from index.ts only |
| Circular dependencies | Architectural violation | Restructure or extract |
| Auto-extracting to shared | Creates premature abstractions | Ask user first |

### Allowed "Garbage" Place

`shared/` is the only allowed place for cross-cutting code, but with rules:

- Must be modular units (not flat files)
- Each unit has single responsibility
- Extraction requires 3+ usages + confirmation

### Examples

```typescript
// ❌ FORBIDDEN: god file
// shared/utils.ts
export function formatDate() { ... }
export function validateEmail() { ... }
export function parseUrl() { ... }
export function calculateTax() { ... }

// ✅ CORRECT: modular units
// shared/lib/format-date/index.ts
export { formatDate } from './format-date';

// shared/lib/validate-email/index.ts
export { validateEmail } from './validate-email';
```

```typescript
// ❌ FORBIDDEN: internal import
import { helper } from '$features/auth/internal/helper';

// ✅ CORRECT: facade import
import { AuthForm } from '$features/auth';
```

</forbidden_practices>

---

<architecture_types>

## Architecture Types

### Detection

1. Check `architecture.xml` in project root
2. If not found → ask user which type applies
3. Apply universal rules + type-specific rules

### Types Overview

| Type | Use Case | Key Characteristic |
|:---|:---|:---|
| single_module | One function/component | Entire package = one module |
| layered_library | Component library, utils | Layers: api, ui, lib, model |
| fsd_standard | Frontend application | Layers: app, pages, [widgets], [features], [entities], shared |
| fsd_domain | Frontend with domains | FSD + domain grouping (user, payments) |
| server_fsd | Backend/CLI application | Layers: controllers, services, models |
| multi_app_monolith | Multiple apps in monorepo | Applications container + common |

### FSD Layers

Only `app` is mandatory. Add layers as project grows:

| Layer | When to add |
|:---|:---|
| app/ | MANDATORY: entry point, providers |
| pages/ | When you have routes |
| widgets/ | For complex page sections |
| features/ | For user interactions |
| entities/ | For business entities |
| shared/ | For cross-cutting code |

### Links to Detailed Rules

- [architecture-single-module.md](architecture-single-module.md)
- [architecture-layered-library.md](architecture-layered-library.md)
- [architecture-fsd-standard.md](architecture-fsd-standard.md)
- [architecture-fsd-domain.md](architecture-fsd-domain.md)
- [architecture-server-fsd.md](architecture-server-fsd.md)
- [architecture-multi-app-monolith.md](architecture-multi-app-monolith.md)

</architecture_types>

---

<xml_schema>

## XML Schema (Minimal)

### Common Tags

| Tag | Purpose | Required Attributes |
|:---|:---|:---|
| `<package_root>` | Root element | — |
| `<source_directory>` | Source folder | `name` |
| `<entrypoint>` | Entry file | `name` |
| `<layer>` | Semantic layer | `name`, `purpose` |
| `<module>` | Modular unit | `name` |
| `<facade>` | Module facade | `name`, `role` |
| `<file>` | Code file | `name`, `role` |
| `<test>` | Test file | `name`, `role` |

### Minimal Example

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="index.ts" />
    <layer name="features" purpose="user interactions">
      <module name="auth">
        <facade name="index.ts" role="slice_facade" />
        <file name="auth-form.tsx" role="component" />
        <file name="types.ts" role="types" />
      </module>
    </layer>
  </source_directory>
</package_root>
```

</xml_schema>

---

<terminology>

## Terminology

| Term | Definition |
|:---|:---|
| **Modular Unit** | Isolated code block with public API and single responsibility |
| **File-module** | Modular unit = 1 file; file itself is the facade |
| **Folder-module** | Modular unit = folder <6 files; index.ts contains function |
| **Container** | Folder grouping multiple modular units; has barrel index.ts |
| **Facade** | Entry point exposing public API, hiding internals |
| **File-facade** | Single file that IS the module (no index.ts needed) |
| **Folder-facade** | index.ts with function implementation (NOT re-exports) |
| **Barrel** | index.ts with ONLY re-exports (for containers) |
| **Cohesion** | How related code is grouped together inside module |
| **Coupling** | Dependencies between modules (lower = better) |
| **Colocation** | Placing code next to where it's used |
| **Auxiliary file** | Helper or private component used by ONLY ONE parent file |
| **Layer** | Vertical abstraction level with dependency rules |
| **Slice** | Horizontal module within a layer (FSD term) |
| **Segment** | Functional block inside slice: ui, model, lib |

</terminology>

---

<quick_reference>

## Quick Reference

### File Structure Rules

**One function per file** — each file contains one main function/component (exception: `helpers.ts` for small related helpers).

**Mandatory separation:**

- Types → `types.ts` (functions MUST NOT export types)
- Constants → `constants.ts` (functions MUST NOT export constants)
- Schemas → `schemas.ts` (Zod/validation schemas)

### Placement Table

| What | Simple structure | Complex structure |
|:---|:---|:---|
| TypeScript type | `types.ts` | `model/types/main.ts` |
| Zod schema | `schemas.ts` | `model/schemas/main.ts` |
| Constant | `constants.ts` | `model/constants/main.ts` |
| Pure function | `helpers.ts` | `lib/helpers/func/index.ts` |
| React hook | `hooks.ts` | `lib/hooks/hook-name/index.ts` |
| File operations | `file.ts` | `services/adapters/file/index.ts` |
| localStorage | `storage.ts` | `services/gateways/storage/index.ts` |
| Business logic | `process.ts` | `services/workflows/process/index.ts` |
| HTTP request | `endpoints.ts` | `api/endpoint/index.ts` |
| React component | `component.tsx` | `ui/component/index.tsx` |

**Note:** In `model` layer: `constants/`, `schemas/`, `types/` are container folders (NOT modular units). Actual modular units are `main.ts` files inside.

### Extraction to Shared

| Usage | Action |
|:---|:---|
| 1-2 modules | Keep in module |
| 3+ modules | ASK USER before extracting to shared |

**Never auto-extract.** Duplication is acceptable if it improves change speed.

### File Naming

- Files: `kebab-case.ts` (`validate-email.ts`)
- Components: `PascalCase.tsx` (`AuthForm.tsx`)
- Folders: `kebab-case/` (`auth-form/`)

### Import Rules

- Inside module: relative (`./types`)
- Between modules: absolute (`$features/auth`)
- Always through facade, never internal paths

</quick_reference>

---

<validation>

## Validation

To validate architecture:

1. Check `architecture.xml` in project root
2. Run: `mcp_mcp-validator_validate validationType="architecture"`
3. Target score: >=85

</validation>

---

<exception_handling>

## Exception Handling

- Ambiguous placement → ask user
- Circular dependency detected → suggest restructure
- God file found → suggest splitting into modular units
- Internal import found → suggest facade import

</exception_handling>

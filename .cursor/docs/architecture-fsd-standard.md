---
id: architecture-fsd-standard
type: reference
alwaysApply: false
---

# FSD Standard Architecture

<expert_role>

You are a frontend architecture consultant specializing in Feature-Sliced Design.

**Task:** Evaluate and enforce FSD architecture patterns for frontend applications.

</expert_role>

---

<overview>

## Overview

**Purpose:** Feature-Sliced Design for frontend applications.

**Use Case:** Complex React/Vue/Angular applications.

**Key Characteristic:** Layers with strict dependency direction, slices with segments.

</overview>

---

<when_to_use>

## When to Use

| Condition | FSD Standard | Other |
|:---|:---|:---|
| Complexity | Medium/high | Simple → single_module |
| Domains | No clear domains | Has domains → fsd_domain |
| Type | Frontend app | Server → server_fsd |
| Scale | Standard app | Multiple apps → multi_app_monolith |

</when_to_use>

---

<layers>

## Layers

### Mandatory Layer

Only `app/` is mandatory. Add other layers as project grows.

### Full Layer Hierarchy

```
src/
├── app/           # MANDATORY: entry, providers, global styles
├── pages/         # Route pages
├── widgets/       # Complex page sections
├── features/      # User interactions
├── entities/      # Business entities
└── shared/        # Cross-cutting code
```

### Layer Dependencies

| Layer | Can import from |
|:---|:---|
| app | everything below |
| pages | widgets, features, entities, shared |
| widgets | features, entities, shared |
| features | entities, shared |
| entities | shared only |
| shared | nothing (leaf layer) |

### Rules

- Import only from layers BELOW
- Never import from same-layer slices
- Always through slice facade

</layers>

---

<slice_structure>

## Slice Structure

### Segments

| Segment | Purpose |
|:---|:---|
| `ui/` | React components |
| `model/` | Store, types, business logic |
| `lib/` | Utilities for this slice |
| `api/` | API calls for this slice |

### Small Slice (flat)

```
features/auth/
├── index.ts        # facade
├── auth-form.tsx   # component
├── types.ts        # types
└── __tests__/
```

### Large Slice (with segments)

```
features/auth/
├── index.ts        # ONLY facade (in slice root)
├── ui/             # Segment (NO index.ts)
│   ├── auth-form.tsx
│   ├── login-button.tsx
│   └── types.ts    # UI-specific types
├── model/          # Segment (NO index.ts)
│   ├── auth-store.ts
│   ├── types.ts    # model types
│   └── constants.ts
├── lib/            # Segment (NO index.ts)
│   └── validate-credentials.ts
└── __tests__/
```

**CRITICAL: Segments are NOT modular units**

Segments (ui/, model/, lib/) are organizational folders inside slice. They do NOT have index.ts. Only the slice root has a facade.

### Colocation Rule

Types, helpers, constants belong to segment that uses them:

- UI types → `ui/types.ts`
- Store types → `model/types.ts`
- Shared across segments → slice root

</slice_structure>

---

<shared_layer>

## Shared Layer

### Structure

**Variant 1: Flat containers**

```
shared/
├── ui/                     <- Container (NO index.ts)
│   ├── button/             <- Folder-module
│   │   └── index.ts
│   └── input/
│       └── index.ts
├── lib/                    <- Container (NO index.ts)
│   ├── format-date.ts      <- File-module
│   └── validate-email/     <- Folder-module
│       └── index.ts
```

**Variant 2: Containers with sub-containers (thematic grouping)**

```
shared/
├── ui/                     <- Container (NO index.ts)
│   ├── base/               <- Sub-container (NO index.ts)
│   │   ├── button/         <- Folder-module
│   │   └── input/
│   ├── forms/              <- Sub-container (NO index.ts)
│   │   └── text-field/
│   └── feedback/           <- Sub-container (NO index.ts)
│       └── toast/
├── lib/                    <- Container (NO index.ts)
│   ├── helpers/            <- Sub-container (NO index.ts)
│   │   ├── format-date.ts  <- File-module
│   │   └── parse-url.ts
│   ├── hooks/              <- Sub-container (NO index.ts)
│   │   ├── use-debounce/   <- Folder-module
│   │   └── use-timer.ts    <- File-module
│   └── validators/         <- Sub-container (NO index.ts)
│       └── validate-email/
```

**Import directly to modular units (any nesting level):**

```typescript
// Flat
import { Button } from '$shared/ui/button';
import { formatDate } from '$shared/lib/format-date';

// With sub-containers
import { Button } from '$shared/ui/base/button';
import { formatDate } from '$shared/lib/helpers/format-date';
import { useDebounce } from '$shared/lib/hooks/use-debounce';
```

**CRITICAL: Containers at ANY level have NO index.ts**

All containers (ui/, lib/, helpers/, hooks/, base/) do NOT have index.ts. Only modular units (button/, format-date.ts) have facades.

### Rules

- Only truly shared code (3+ usages)
- Each item inside container is a modular unit with its own facade
- Containers (ui/, lib/) have barrel index.ts
- No god files (`shared/utils.ts` forbidden)
- Extraction requires confirmation

</shared_layer>

---

<modular_unit_here>

## What is a Modular Unit Here?

### Layers vs Slices vs Modules

| Element | Is Modular Unit? | Facade Type |
|:---|:---|:---|
| `features/` | NO (layer) | — |
| `features/auth/` | YES (slice) | Depends on size |
| `shared/` | NO (layer) | — |
| `shared/lib/` | NO (container) | NO index.ts |
| `shared/lib/format-date.ts` | YES (file-module) | File-facade |
| `shared/lib/validate-email/` | YES (folder-module) | Folder-facade |

### Slice Facade Types

| Slice Size | Facade Contains |
|:---|:---|
| Small (1-3 files, flat) | Re-exports from component files |
| Large (segments) | Re-exports from segments |

### Small Slice: Barrel Facade

```
features/auth/
├── index.ts        <- Barrel (re-exports)
├── auth-form.tsx   <- Component
└── types.ts        <- Internal
```

```typescript
// features/auth/index.ts — barrel, re-exports
export { AuthForm } from './auth-form';
export type { AuthFormProps } from './types';
```

### Shared Layer: Mixed Facades

```
shared/
├── lib/
│   ├── index.ts               <- Barrel (layer container)
│   ├── format-date.ts         <- File-module (IS facade)
│   └── validate-email/        <- Folder-module
│       ├── index.ts           <- Contains function
│       ├── types.ts           <- Internal
│       └── constants.ts       <- Internal
└── ui/
    ├── index.ts               <- Barrel
    └── button/                <- Folder-module
        ├── index.ts           <- Contains component OR re-exports
        └── button.tsx
```

### CRITICAL: No False Positives

**DO NOT require** `index.ts` for:

- `shared/lib/format-date.ts` — file IS the facade
- Segments inside slices (ui/, model/, lib/) — organizational folders
- Container folders in shared (`shared/ui/`, `shared/lib/`) — just group modules
- Single-file slices in layers

**DO require** `index.ts` for:

- Slice folders (`features/auth/`) — facade in slice ROOT only
- Folder-modules in shared (`shared/lib/validate-email/`, `shared/ui/button/`)

</modular_unit_here>

---

<import_rules>

## Import Rules

### Dependency Direction

```typescript
// ✅ CORRECT: feature imports from entity
import { UserCard } from '$entities/user';

// ❌ WRONG: entity imports from feature
import { AuthForm } from '$features/auth'; // FORBIDDEN
```

### Same-Layer Imports

```typescript
// ❌ WRONG: feature imports from feature
import { CartButton } from '$features/cart'; // FORBIDDEN

// ✅ CORRECT: extract to shared or duplicate
```

### Facade Only

```typescript
// ❌ WRONG: internal import
import { authReducer } from '$features/auth/model/store';

// ✅ CORRECT: facade import
import { authReducer } from '$features/auth';
```

### When to Add Layers

| Trigger | Add Layer |
|:---|:---|
| First route | `pages/` |
| Reusable page section | `widgets/` |
| User interaction logic | `features/` |
| Business entity with UI | `entities/` |
| Cross-cutting utility | `shared/` |

</import_rules>

---

<xml_schema>

## XML Schema

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="app/index.ts" />

    <layer name="pages" purpose="routes">
      <module name="home">
        <facade name="index.ts" role="slice_facade" />
        <segment name="ui" purpose="components">
          <file name="home-page.tsx" role="component" />
        </segment>
      </module>
    </layer>

    <layer name="features" purpose="interactions">
      <module name="auth">
        <facade name="index.ts" role="slice_facade" />
        <segment name="ui" purpose="components">
          <file name="auth-form.tsx" role="component" />
        </segment>
        <segment name="model" purpose="logic">
          <file name="auth-store.ts" role="function" />
          <file name="types.ts" role="types" />
        </segment>
      </module>
    </layer>

    <layer name="shared" purpose="cross-cutting">
      <directory name="ui">
        <module name="button">
          <facade name="index.ts" role="unit_facade" />
          <file name="button.tsx" role="component" />
        </module>
      </directory>
    </layer>
  </source_directory>
</package_root>
```

</xml_schema>

---

<examples>

## Examples

### Good: Feature with Segments

```
features/checkout/
├── index.ts              # export { CheckoutForm, checkoutStore }
├── ui/
│   ├── checkout-form.tsx
│   ├── payment-step.tsx
│   └── types.ts          # CheckoutFormProps
├── model/
│   ├── checkout-store.ts
│   ├── types.ts          # CheckoutState
│   └── constants.ts      # CHECKOUT_STEPS
└── __tests__/
```

### Bad: Scattered Feature Code

```
features/checkout/
├── checkout-form.tsx
model/types/
├── checkout.ts           # ❌ types outside feature
shared/lib/
├── checkout-helpers.ts   # ❌ helpers outside feature
```

</examples>

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

- Cross-slice import detected → extract to shared or duplicate
- Upward import detected → restructure to lower layer
- Slice too large → split into segments
- Shared item used by 1-2 slices → move back to slice

</exception_handling>

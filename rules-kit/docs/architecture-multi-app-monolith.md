---
id: architecture-multi-app-monolith
type: reference
alwaysApply: false
---

# Multi-App Monolith Architecture

<expert_role>

You are a software architect specializing in multi-application monorepo design.

**Task:** Evaluate and enforce multi-app monolith architecture patterns.

</expert_role>

---

<overview>

## Overview

**Purpose:** Multiple applications in single repository.

**Use Case:** Monorepositories with frontend, backend, CLI, admin panels.

**Key Characteristic:** Applications container with shared common code.

</overview>

---

<when_to_use>

## When to Use

| Condition    | Multi-App Monolith     | Other                         |
| :----------- | :--------------------- | :---------------------------- |
| Applications | 2-7 independent apps   | 1 app → fsd_standard          |
| Isolation    | Only through common    | Direct imports → not suitable |
| Shared code  | In applications/common | No reuse → separate repos     |
| Entry points | Own for each app       | Single → fsd_standard         |

</when_to_use>

---

<structure>

## Structure

```
monorepo/
├── src/
│   ├── index.ts              # optional root entry
│   │
│   ├── applications/
│   │   ├── admin-frontend/   # Admin React app
│   │   │   ├── index.ts
│   │   │   ├── pages/
│   │   │   ├── features/
│   │   │   └── ...
│   │   │
│   │   ├── public-frontend/  # Public React app
│   │   │   ├── index.ts
│   │   │   ├── pages/
│   │   │   └── ...
│   │   │
│   │   ├── cli-tools/        # CLI application
│   │   │   ├── index.ts
│   │   │   ├── commands/
│   │   │   └── ...
│   │   │
│   │   └── common/           # Shared between apps
│   │       ├── index.ts
│   │       ├── lib/
│   │       ├── ui/
│   │       └── model/
│   │
│   └── packages/             # Optional: publishable packages
│       └── sdk/
```

</structure>

---

<applications>

## Applications

### Application Independence

Each application:

- Has own entry point (`index.ts`)
- Has own internal structure (can use FSD, layered, etc.)
- Can import from `common/` only
- Cannot import from other applications

### Common Application

`applications/common/` is the shared layer:

- Contains code used by 2+ applications
- Structured like layered_library
- Extraction requires confirmation

### Application Internal Structure

Each app chooses its own architecture:

```
admin-frontend/          # FSD structure
├── index.ts
├── app/
├── pages/
├── features/
└── shared/              # App-specific shared

cli-tools/               # Simple structure
├── index.ts
├── commands/
│   ├── init/
│   └── build/
└── lib/
```

</applications>

---

<modular_unit_here>

## What is a Modular Unit Here?

### Applications vs Modules

| Element                                  | Is Modular Unit?    | Facade Type   |
| :--------------------------------------- | :------------------ | :------------ |
| `applications/`                          | NO (container)      | —             |
| `applications/admin-frontend/`           | NO (application)    | Entry point   |
| `applications/common/`                   | NO (shared app)     | Entry point   |
| `applications/common/lib/format-date.ts` | YES (file-module)   | File-facade   |
| `applications/common/ui/button/`         | YES (folder-module) | Folder-facade |

### Application Entry Points

Each application has `index.ts` as entry point (NOT modular unit facade):

```
applications/
├── admin-frontend/
│   └── index.ts       <- Application entry (NOT module facade)
├── cli-tools/
│   └── index.ts       <- Application entry
└── common/
    └── index.ts       <- Shared app entry
```

### Modules Inside Common

Common follows layered_library rules:

```
common/
├── index.ts               <- Application entry
├── lib/
│   ├── index.ts           <- Layer barrel
│   ├── format-date.ts     <- File-module (IS facade)
│   └── validate-email/    <- Folder-module
│       ├── index.ts       <- Contains function
│       └── types.ts       <- Internal
└── ui/
    ├── index.ts           <- Layer barrel
    └── button/            <- Folder-module
        ├── index.ts       <- Contains component
        └── button.tsx
```

### Modules Inside Applications

Each app can have its own modular units following its internal architecture:

```
admin-frontend/
├── index.ts
├── features/
│   └── user-management/   <- Slice (modular unit)
│       └── index.ts       <- Slice facade
└── shared/
    └── admin-layout/      <- Folder-module
        └── index.ts       <- Contains component
```

### CRITICAL: No False Positives

**DO NOT require** `index.ts` for:

- `common/lib/format-date.ts` — file IS the facade

**DO require** `index.ts` for:

- Application folders (entry point)
- Folder-modules in common (`common/lib/validate-email/`)
- Slices in applications (`admin-frontend/features/user-management/`)

</modular_unit_here>

---

<rules>

## Rules

### Import Rules

```typescript
// ✅ CORRECT: import from common
import { Button } from '$applications/common/ui';
import { formatDate } from '$applications/common/lib';

// ❌ WRONG: cross-app import
import { AdminLayout } from '$applications/admin-frontend/layouts';
```

### Colocation

- App-specific code stays in that app
- Cross-app code goes to `common/`
- Don't prematurely extract to common

### When to Move to Common

Move to `common/` when:

- 2+ applications need identical code
- Logic is stable and won't diverge
- User confirms extraction

### Common Structure

```
common/
├── index.ts           # facade
├── ui/                # Shared components
│   ├── button/
│   └── modal/
├── lib/               # Shared utilities
│   ├── hooks/
│   └── helpers/
├── api/               # Shared API clients
│   └── base-fetcher/
└── model/             # Shared types
    ├── types/
    └── constants/
```

</rules>

---

<xml_schema>

## XML Schema

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="index.ts" />

    <application name="admin-frontend">
      <entrypoint name="index.ts" />
      <layer name="pages" purpose="admin pages">
        <module name="dashboard">
          <facade name="index.ts" role="slice_facade" />
          <file name="dashboard.tsx" role="component" />
        </module>
      </layer>
    </application>

    <application name="cli-tools">
      <entrypoint name="index.ts" />
      <directory name="commands">
        <module name="init">
          <facade name="index.ts" role="unit_facade" />
          <file name="init-command.ts" role="function" />
        </module>
      </directory>
    </application>

    <application name="common">
      <entrypoint name="index.ts" />
      <layer name="ui" purpose="shared components">
        <module name="button">
          <facade name="index.ts" role="unit_facade" />
          <file name="button.tsx" role="component" />
        </module>
      </layer>
      <layer name="lib" purpose="shared utilities">
        <module name="format-date">
          <facade name="index.ts" role="unit_facade" />
          <file name="format-date.ts" role="function" />
        </module>
      </layer>
    </application>
  </source_directory>
</package_root>
```

</xml_schema>

---

<examples>

## Examples

### Good: Proper Separation

```
applications/
├── admin-frontend/
│   ├── features/
│   │   └── user-management/  # Admin-only feature
│   └── shared/               # Admin-specific shared
│       └── admin-layout/
│
├── public-frontend/
│   ├── features/
│   │   └── product-catalog/  # Public-only feature
│   └── shared/
│
└── common/
    ├── ui/
    │   └── button/           # Used by both apps
    └── lib/
        └── format-currency/  # Used by both apps
```

### Bad: Cross-App Import

```typescript
// admin-frontend/pages/users.tsx
// ❌ WRONG: importing from another app
import { ProductCard } from '$applications/public-frontend/features/catalog';

// ✅ CORRECT: if shared, move to common
import { ProductCard } from '$applications/common/ui';
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

- Cross-app import detected → move to common/ or duplicate
- Common item used by 1 app only → move back to that app
- App-specific code in common/ → move to correct application

</exception_handling>

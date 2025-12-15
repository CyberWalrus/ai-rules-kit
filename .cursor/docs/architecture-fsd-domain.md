---
id: architecture-fsd-domain
type: reference
alwaysApply: false
---

# FSD Domain Architecture

<expert_role>

You are a FSD Domain Architecture Specialist for TypeScript/React projects with domain separation.

**Task:** Enforce FSD architecture with domain grouping (user, payments, betting) in widgets, features, entities layers.

</expert_role>

---

<overview>

## Overview

**Purpose:** Large frontend applications with explicit business domains.

**Use Case:** Enterprise apps with multiple business areas (user management, payments, betting).

**Key Characteristic:** FSD layers + domain folders grouping slices by business entity.

</overview>

---

<when_to_use>

## When to Use

| Condition | FSD Domain | FSD Standard |
|:---|:---|:---|
| Business domains | 2+ explicit domains | No clear domains |
| Complexity | High (>50 slices) | Medium |
| Team structure | Domain teams | Single team |
| Scale | Enterprise | Standard app |

</when_to_use>

---

<layer_hierarchy>

## Layer Hierarchy

| Layer | Purpose | Has Domains? |
|:---|:---|:---|
| app | Entry, providers, global styles | No |
| pages | Route pages | No |
| widgets | Complex page sections | **Yes** |
| features | User interactions | **Yes** |
| entities | Business models | **Yes** |
| shared | Cross-cutting utilities | No |

**Dependency direction:** app → pages → widgets → features → entities → shared

</layer_hierarchy>

---

<domain_structure>

## Domain Structure

### Where Domains Apply

Domains group slices ONLY in: `widgets/`, `features/`, `entities/`

```
src/
├── app/                    # No domains
├── pages/                  # No domains
│   ├── home/
│   └── profile/
├── widgets/
│   ├── user/               # Domain: user
│   │   └── user-header/
│   └── payments/           # Domain: payments
│       └── payment-widget/
├── features/
│   ├── user/               # Domain: user
│   │   ├── auth/
│   │   └── profile/
│   └── payments/           # Domain: payments
│       └── payment-form/
├── entities/
│   ├── user/               # Domain: user
│   │   └── user/
│   └── payments/           # Domain: payments
│       └── payment/
└── shared/                 # No domains
```

### Common Domains

| Domain | Description | Slice Examples |
|:---|:---|:---|
| user | User management | auth, profile, registration |
| payments | Payment system | payment-form, billing, cards |
| betting | Bets and predictions | bet-slip, odds, events |
| gambling | Casino games | slots, poker, live-games |
| loyalty | Loyalty programs | points, rewards, bonuses |

</domain_structure>

---

<modular_unit_here>

## What is a Modular Unit Here?

### Layers vs Domains vs Slices

| Element | Is Modular Unit? | Facade Type |
|:---|:---|:---|
| `features/` | NO (layer) | — |
| `features/user/` | NO (domain container) | — |
| `features/user/auth/` | YES (slice) | Depends on size |
| `shared/lib/` | NO (container) | NO index.ts |
| `shared/lib/format-date.ts` | YES (file-module) | File-facade |

### Domain Containers Need No Facade

Domain folders just group slices, no index.ts needed:

```
features/
├── user/                  <- Domain (NO facade needed)
│   ├── auth/              <- Slice (HAS facade)
│   │   └── index.ts
│   └── profile/           <- Slice (HAS facade)
│       └── index.ts
└── payments/              <- Domain (NO facade needed)
    └── payment-form/      <- Slice (HAS facade)
        └── index.ts
```

### Slice Facade in Domain

```typescript
// features/user/auth/index.ts — slice facade
// Re-exports from files, NOT from segments (segments have NO index.ts)
export { AuthForm } from './ui/auth-form';
export { useAuth } from './model/use-auth';
```

**CRITICAL: Segments have NO index.ts**

Segments (ui/, model/) are organizational folders. Import directly from files inside segments.

### Shared Layer (No Domains)

Same rules as fsd_standard — containers have NO index.ts:

```
shared/lib/                    <- Container (NO index.ts)
├── format-date.ts             <- File-module (IS facade)
└── validate-email/            <- Folder-module
    └── index.ts               <- Contains function
```

**Import directly:** `import { formatDate } from '$shared/lib/format-date'`

### CRITICAL: No False Positives

**DO NOT require** `index.ts` for:

- Domain folders (`features/user/`)
- Segments inside slices (ui/, model/, lib/)
- File-modules (`shared/lib/format-date.ts`)

**DO require** `index.ts` for:

- Slices within domains (`features/user/auth/`)
- Folder-modules in shared (`shared/lib/validate-email/`)

</modular_unit_here>

---

<rules>

## Rules

### Requirements

- Layer hierarchy matches FSD (downward dependencies only)
- Domains group slices in widgets, features, entities
- Each slice has `index.ts` facade
- No cross-imports between slices in same domain on same layer
- Inter-domain imports follow layer hierarchy
- Named exports only

### Forbidden

- Layer hierarchy violation (import from upper layers)
- Cross-imports within same domain on same layer
- Direct import from slice internals (only through facades)
- Cyclic dependencies between domains
- Default exports

### Import Examples

```typescript
// ✅ ALLOWED: features/payments → entities/user (lower layer, different domain)
import { User } from '$entities/user';

// ✅ ALLOWED: widgets/betting → features/user (lower layer, different domain)
import { AuthForm } from '$features/user';

// ❌ FORBIDDEN: features/user/auth → features/user/profile (same layer, same domain)
import { ProfileForm } from '$features/user/profile';

// ❌ FORBIDDEN: features/user → widgets/payments (upper layer)
import { PaymentWidget } from '$widgets/payments';
```

</rules>

---

<xml_schema>

## XML Schema

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="app/index.ts" />
    
    <layer name="pages" purpose="route pages">
      <module name="home">
        <facade name="index.ts" role="slice_facade" />
        <file name="home-page.tsx" role="component" />
      </module>
    </layer>
    
    <layer name="features" purpose="user interactions">
      <directory name="user">
        <module name="auth">
          <facade name="index.ts" role="slice_facade" />
          <file name="auth-form.tsx" role="component" />
        </module>
      </directory>
      <directory name="payments">
        <module name="payment-form">
          <facade name="index.ts" role="slice_facade" />
          <file name="payment-form.tsx" role="component" />
        </module>
      </directory>
    </layer>
    
    <layer name="shared" purpose="cross-cutting">
      <module name="button">
        <facade name="index.ts" role="unit_facade" />
        <file name="button.tsx" role="component" />
      </module>
    </layer>
  </source_directory>
</package_root>
```

</xml_schema>

---

<suitability>

## Suitability

### Suitable For

- Large frontend applications with domain separation
- Projects with multiple business areas
- Teams with FSD experience
- Enterprise applications

### Not Suitable For

- Simple applications → use `single_module` or `layered_library`
- No clear domains → use `fsd_standard`
- Server applications → use `server_fsd`
- Multiple apps in repo → use `multi_app_monolith`

</suitability>

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

- Cross-domain import on same layer → extract to shared or duplicate
- Upward import detected → restructure to lower layer
- Domain too large → consider splitting into sub-domains
- Slice used across domains → move to shared

</exception_handling>

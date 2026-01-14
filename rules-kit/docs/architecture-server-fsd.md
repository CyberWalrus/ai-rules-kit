---
id: architecture-server-fsd
type: reference
alwaysApply: false
---

# Server FSD Architecture

<expert_role>

You are a Server FSD Architecture Specialist for TypeScript backend projects.

**Task:** Enforce FSD-like architecture for Node.js servers, APIs, CLI tools, and microservices.

</expert_role>

---

<overview>

## Overview

**Purpose:** Server and console applications with layered architecture.

**Use Case:** REST APIs, GraphQL servers, CLI utilities, microservices.

**Key Characteristic:** Flexible layer names adapted for backend (controllers, services, models).

</overview>

---

<when_to_use>

## When to Use

| Condition        | Server FSD                | Other                         |
| :--------------- | :------------------------ | :---------------------------- |
| Application type | Backend/CLI               | Frontend → use fsd_standard   |
| Layers           | 3-7 custom layers         | Simple → use single_module    |
| Modularity       | Facades, no cross-imports | Flat → use layered_library    |
| Scale            | Medium to large           | Library → use layered_library |

</when_to_use>

---

<typical_layers>

## Typical Layers

| Layer        | Purpose                 | Content                    |
| :----------- | :---------------------- | :------------------------- |
| controllers  | HTTP controllers/routes | REST endpoints, middleware |
| services     | Business logic          | Workflows, use cases       |
| models       | Data models/schemas     | Types, Zod schemas         |
| repositories | Data access             | Database queries, ORM      |
| middleware   | Middleware              | Auth, logging, validation  |
| config       | Configuration           | Environment, settings      |
| utils        | Utilities/helpers       | Helper functions           |
| adapters     | External adapters       | API clients                |
| gateways     | Infrastructure          | Database, message queues   |

</typical_layers>

---

<structure>

## Structure Example

```
src/
├── index.ts              # Entry point
├── controllers/
│   ├── auth/
│   │   ├── index.ts      # facade
│   │   └── auth-controller.ts
│   └── users/
│       ├── index.ts
│       └── users-controller.ts
├── services/
│   ├── auth-service/
│   │   ├── index.ts
│   │   └── auth-service.ts
│   └── user-service/
│       └── ...
├── models/
│   ├── user/
│   │   ├── index.ts
│   │   ├── user-types.ts
│   │   └── user-schemas.ts
│   └── auth/
│       └── ...
├── repositories/
│   └── user-repository/
│       └── ...
└── config/
    ├── database/
    └── app/
```

</structure>

---

<modular_unit_here>

## What is a Modular Unit Here?

### Layers vs Modules

| Element                  | Is Modular Unit?    | Facade Type   |
| :----------------------- | :------------------ | :------------ |
| `controllers/`           | NO (layer)          | —             |
| `controllers/auth/`      | YES (folder-module) | Folder-facade |
| `services/auth-service/` | YES (folder-module) | Folder-facade |
| `lib/format-date.ts`     | YES (file-module)   | File-facade   |

### File-Module Example

Single file in layer = file IS the facade:

```
lib/
├── index.ts           <- Barrel (layer container)
└── format-date.ts     <- File-module (IS facade)
```

### Folder-Module Example

Module with internal files = index.ts contains function:

```
services/
├── auth-service/
│   ├── index.ts           <- Contains function (NOT re-exports)
│   ├── auth-service.ts    <- Main implementation (if index.ts re-exports)
│   ├── types.ts           <- Internal
│   └── constants.ts       <- Internal
```

**Two valid patterns:**

1. **index.ts = function:** `index.ts` contains the main function directly
2. **index.ts = re-exports:** `index.ts` re-exports from `auth-service.ts`

Choose based on module complexity.

### Layer Barrels

Layer containers have barrel index.ts:

```typescript
// controllers/index.ts — barrel
export { authController } from './auth';
export { usersController } from './users';
```

### CRITICAL: No False Positives

**DO NOT require** separate `index.ts` for:

- `lib/format-date.ts` — file IS the facade

**DO require** `index.ts` for:

- Folder-modules (`services/auth-service/`)
- Layer containers (`controllers/`)

</modular_unit_here>

---

<rules>

## Rules

### Requirements

- Each module has `index.ts` facade
- No cross-imports between modules of same layer
- Complex modules divided into segments
- Named exports only
- Internal details hidden behind facade
- Tests in `__tests__/` at module level

### Forbidden

- Cross-imports between same-layer modules
- Direct import from module internals
- Export of auxiliary elements through facades
- Default exports
- Cyclic dependencies between layers

### Layer Recommendations

- **Define hierarchy:** Establish clear dependency direction
- **Document rules:** Explicitly describe which layer depends on which
- **Limit quantity:** No more than 5-7 layers
- **Meaningful names:** Use domain terminology

</rules>

---

<xml_schema>

## XML Schema

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="index.ts" />

    <layer name="controllers" purpose="HTTP controllers">
      <module name="auth">
        <facade name="index.ts" role="unit_facade" />
        <file name="auth-controller.ts" role="function" />
      </module>
    </layer>

    <layer name="services" purpose="business logic">
      <module name="auth-service">
        <facade name="index.ts" role="unit_facade" />
        <file name="auth-service.ts" role="function" />
      </module>
    </layer>

    <layer name="models" purpose="data models">
      <module name="user">
        <facade name="index.ts" role="unit_facade" />
        <file name="user-types.ts" role="types" />
        <file name="user-schemas.ts" role="schemas" />
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

- Node.js servers (Express, Fastify, NestJS)
- CLI applications
- REST/GraphQL APIs
- Microservices
- Backend libraries and SDKs

### Not Suitable For

- Frontend applications → use `fsd_standard` or `fsd_domain`
- Simple utilities → use `single_module`
- Component libraries → use `layered_library`

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

- Cross-layer import detected → restructure to lower layer
- Module too complex → split into segments
- Layer hierarchy unclear → document explicitly
- Cyclic dependency → extract common code to lower layer

</exception_handling>

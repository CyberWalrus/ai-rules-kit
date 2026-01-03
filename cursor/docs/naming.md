---
id: naming-conventions-guide
type: reference
alwaysApply: false
---

# Naming Conventions Reference Guide

[REFERENCE-BEGIN]

## TIER 1: Expert Role

<expert_role>
You are a Naming Conventions Expert specializing in TypeScript/React projects.
You specialize in ensuring code consistency, readability, and navigation.
You have deep knowledge in: file system, components, functions, types, constants, CSS, testing, Storybook.

**ВАЖНО: Все ответы должны быть на русском языке.**
</expert_role>

## TIER 2: Scope and Application

<algorithm_motivation>
A systematic approach to naming ensures code consistency, improves readability, and simplifies navigation in the project. Clear naming conventions reduce cognitive load for developers and accelerate development.

<completion_criteria>
**Completion criteria:** All project elements are named according to established conventions, consistency is verified
</completion_criteria>
</algorithm_motivation>

<algorithm_steps>

1. **Element type analysis** — determine category (file, component, function, type, constant)
2. **Apply naming rule** — use appropriate casing (kebab-case, camelCase, PascalCase, SCREAMING_SNAKE_CASE)
3. **Consistency check** — ensure compliance with established project standards
4. **Exception validation** — account for special cases and established conventions

<completion_criteria>
**Completion criteria:** Each element has passed all 4 steps of the naming algorithm
</completion_criteria>

<exception_handling>
**Rule conflicts:** prioritize readability over strict convention adherence
**Established exceptions:** document and apply consistently
**External library inheritance:** preserve original naming (React.Component, useState)
**API integrations:** follow external API conventions
**Legacy code migration:** document deviations and plan for standardization
</exception_handling>
</algorithm_steps>

<reference_scope>
Compact reference guide for naming conventions in TypeScript/React projects.
Covers: files, components, functions, types, constants, CSS, tests, Storybook.
Goal: code consistency, readability, navigation.

<cognitive_triggers>
Let's analyze naming conventions step by step to ensure code consistency.
</cognitive_triggers>

<completion_criteria>
**Project completion criteria:** All codebase elements conform to established naming conventions, consistency is verified by automated tools, development team is trained on standards.
</completion_criteria>

<exception_handling>
**General exception handling principles:**

- Rule conflicts: prioritize readability over strict convention adherence
- Established exceptions: document and apply consistently
- External library inheritance: preserve original naming (React.Component, useState)
- API integrations: follow external API conventions
- Legacy code migration: document deviations and standardization plan
- Technical constraints: find compromise solution with minimal deviation from standards
  </exception_handling>
  </reference_scope>

## TIER 3: Core Naming Rules

<completion_criteria>
**Completion criteria:** All naming rules defined with clear examples and exception handling, reference guide ready for use
</completion_criteria>

<output_format>
**Response format:** Structured reference guide with code examples and clear naming rules for each type of project element.

**Response structure:**

1. Element type definition (file, component, function, type)
2. Applied naming rule (kebab-case, camelCase, PascalCase)
3. Concrete examples with comments
4. Exceptions and special cases

<completion_criteria>
**Completion criteria:** All naming rules applied consistently, examples conform to established standards
</completion_criteria>
</output_format>

<naming_rules>

### Projects and Repositories: kebab-case

<project_naming>
**Rule:** Project/repository names use kebab-case or lowercase

- `cursor-rules` — configuration and rules
- `vite-plugin-react` — plugin with context
- `typescript-utils` — utility library
- `my-app` — simple application
- Length: 2-4 words (up to 30 characters optimal)
- Descriptiveness: name should explain project purpose

<completion_criteria>
**Completion criteria:** Project name in kebab-case, descriptive, unique, verified for availability on GitHub/npm
</completion_criteria>

<exception_handling>
**npm scoped packages:** format `@scope/package-name` allowed
**Domain names:** dots allowed (e.g., `next.js`)
**Brand names:** single word lowercase (e.g., `react`, `vite`)
</exception_handling>
</project_naming>

### File System: kebab-case

<file_naming>
**Rule:** All files and directories use kebab-case

- `base-button.tsx` — React component
- `checkbox-variants.ts` — style variants
- `form-validation.test.tsx` — test file
- `user-settings/` — directory

<completion_criteria>
**Completion criteria:** All new files named in kebab-case, directories checked for compliance
</completion_criteria>
</file_naming>

### Code: camelCase/PascalCase

<code_naming>
**React components:** PascalCase

- `BaseButton`, `Checkbox`, `ErrorBoundary`

**Functions/variables:** camelCase

- `validateInput`, `userData`, `isLoading`
- Booleans with prefixes: `isValid`, `hasError`, `canSubmit`

**Types:** PascalCase with suffixes

- `BaseButtonProps` — component props
- `ButtonState` — state
- `ButtonVariants` — style variants

**Zod schemas:** camelCase with Schema suffix

- `configSchema` — configuration schema
- `userValidationSchema` — user validation schema

**Constants:** SCREAMING_SNAKE_CASE

- `API_ENDPOINTS`, `BUTTON_SIZES`, `MAX_RETRY_COUNT`
- Regular expressions with `_REGEX` or `_RX` suffix: `EMAIL_REGEX`, `ID_PART_RX`

**Union types instead of enum:**

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
```

<completion_criteria>
**Completion criteria:** All code elements use correct casing for their category
</completion_criteria>
</code_naming>

### Function Prefixes

<function_prefixes>
**Rule:** Functions use prefixes to indicate purpose

**Selectors and getters:** prefix `get`

- `getAuthStatus` — get authorization status
- `getTeamName` — extract team name
- `getEventUrl` — form event URL
- `getCurrentWallet` — get current wallet

**Event handlers:** prefix `handle`

- `handleSafeBack` — back navigation handler
- `handleSendAmplitude` — metrics sending handler
- `handleSubmit` — form submission handler

**Redux Saga watchers:** prefix `watch`

- `watchGetBalance` — balance retrieval watcher
- `watchSetUserSettings` — settings watcher
- `watchLoginSuccess` — successful login watcher

**Callbacks:** prefix `on`

- `onJsonResponse` — callback on JSON response
- `onExpired` — expiration callback
- `onClickAway` — click outside element callback

**Factories:** prefix `create`

- `createErrorBuffer` — create error buffer
- `createLogger` — create logger
- `createAction` — create Redux action

**Async HTTP requests:** prefix `fetch`

- `fetchInit` — data initialization
- `fetchToken` — get token
- `fetchUserData` — load user data

**Mutating actions:** prefixes `set/add/remove/reset/update`

- `setUserSettings` — set settings
- `addFavorites` — add to favorites
- `removeFavorites` — remove from favorites
- `resetUserSettingsMessage` — reset message
- `updateMohioToken` — update token

<completion_criteria>
**Completion criteria:** All functions use correct prefixes according to purpose
</completion_criteria>

<exception_handling>
**External libraries:** preserve original names (useState, useEffect)
**Established conventions:** follow existing project patterns
**Prefix conflicts:** choose most accurately descriptive prefix
</exception_handling>
</function_prefixes>

### Special Files

<special_files_naming>
**Rule:** Special files have standardized names

**Module entry point:** `main.ts`

- `model/types/main.ts` — module types
- `model/constants/main.ts` — module constants
- `model/actions/main.ts` — module actions
- `model/selectors/main.ts` — module selectors

**Helper functions:** `helpers.ts`

- `lib/helpers/validation-helpers.ts` — validation helpers
- `use-navigate/helpers.ts` — navigation hook helpers

**Redux Saga files:** suffix `-saga`

- `auth-saga.ts` — authorization saga
- `notification-saga.ts` — notifications saga
- `favorites-saga.ts` — favorites saga

<completion_criteria>
**Completion criteria:** Special files named according to standards, easily identifiable
</completion_criteria>

<exception_handling>
**Multiple main files:** use descriptive names (`main-server.ts`, `main-client.ts`)
**Helpers without context:** add domain description (`validation-helpers.ts`)
</exception_handling>
</special_files_naming>

### React Naming

<react_naming>
**Rule:** Specific conventions for React code

**HTML elements (DOM):** prefix `$` + suffix `Ref`

- `$inputRef` — input element ref
- `$containerRef` — container element ref
- `$imageRef` — image element ref
- `$elementRef` — DOM element ref

**Other values (boolean, number, object, etc.):** suffix `Ref` only

- `timerRef` — timer ID
- `mountedRef` — mounting flag
- `savedCallbackRef` — saved callback
- `previousPropsRef` — previous props

**Combined refs:** suffix `Ref` only (no `$` prefix). If inside there is a parameter that is a reference to an HTML element, then that parameter has prefix `$` + suffix `Ref`

```typescript
const formRef = useRef<{
    $inputRef: HTMLInputElement | null;
    submit: () => void;
} | null>(null);
```

**In props/hook parameters:** one ref → always `ref`, multiple refs → apply naming rules

```typescript
// Single ref in props
<Input ref={$inputRef} />

// Multiple refs in props
<Form $inputRef={$inputRef} timerRef={timerRef} />
```

**forwardRef:** standard name `ref` (React API requirement)

```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <button ref={ref}>Click</button>;
});
```

<completion_criteria>
**Completion criteria:** All refs named according to their type: HTML elements with $ prefix + Ref suffix, other values with Ref suffix only, combined refs with Ref suffix only, single ref in props as `ref`, forwardRef as `ref`
</completion_criteria>

<exception_handling>
**HTML elements:** always use `$` prefix + `Ref` suffix
**Other values:** use `Ref` suffix only (no `$` prefix)
**Combined refs:** use `Ref` suffix only, inner HTML element parameters use `$` prefix + `Ref` suffix
**Props with single ref:** always use `ref` name
**Props with multiple refs:** apply naming rules
**forwardRef:** always use `ref` name (React API requirement)
</exception_handling>
</react_naming>

### Type Suffixes

<type_suffixes>
**Rule:** Types use suffixes to indicate purpose

**Function parameters:** suffix `Params`

- `GetTeamNameParams` — get team name parameters
- `UseTimerProps` — timer hook parameters
- `CopyTextWithAlertParams` — copy with alert parameters

**Return values:** suffix `Result` or `Return`

- `GetLiveMatchStatusResult` — get match status result
- `AsyncFnReturn` — async function return value
- `GetFavoriteUniqueIdsReturn` — get unique IDs result

**Base enum-like types:** suffix `Type`

- `VipStatusType` — VIP status type
- `FavoriteEntityType` — favorite entity type
- `EventsView` — events view type (exception: short view types)

<completion_criteria>
**Completion criteria:** All types use correct suffixes according to purpose
</completion_criteria>

<exception_handling>
**Props vs Params:** Props for React components, Params for functions
**Short types:** acceptable without suffix if context is obvious
**Suffix conflicts:** choose most accurate suffix
</exception_handling>
</type_suffixes>

### Redux Patterns

<redux_naming>
**Rule:** Redux code follows specific naming conventions

**Action types:** namespace pattern `@@domain__module/ACTION_NAME`

- `@@lib-ui__account/LOGIN` — account login
- `@@favorite/ADD` — add to favorites
- `@@line/SET_LINE` — set line
- Format: domain double-underscore module slash ACTION

**Action creators:** use `createAction` helper

```typescript
export const loginSuccess = createAction('@@lib-ui__account/LOGIN_SUCCESS', (payload) => ({ payload }));
```

**Saga functions:** prefix `watch` for watchers

- `watchGetBalance` — balance retrieval watcher
- `watchSetUserSettings` — settings watcher
- `watchLoginSuccess` — successful login watcher

<completion_criteria>
**Completion criteria:** All Redux elements follow established naming patterns
</completion_criteria>

<exception_handling>
**Vanilla Redux migration:** gradual transition to createAction
**External middleware:** maintain compatibility with their conventions
</exception_handling>
</redux_naming>

### CSS: kebab-case (Tailwind)

<css_naming>

- `bg-primary-500`, `text-icon-normal`
- Variant functions: `baseButtonVariants`, `checkboxVariants`

<completion_criteria>
**Completion criteria:** CSS classes conform to Tailwind conventions, style functions named consistently
</completion_criteria>
</css_naming>

</naming_rules>

## TIER 4: Special Cases

<completion_criteria>
**Completion criteria:** All special cases (testing, Storybook, imports/exports) documented with examples and exceptions
</completion_criteria>

<special_cases>

### Testing

<test_naming>
**Files:** kebab-case by component name

- `button.test.tsx`, `form-validation.e2e.test.tsx`

**Descriptions:** Russian language

```typescript
describe('Button', () => {
    it('проверка скриншота кнопки по умолчанию', () => {});
    it('вызывает onClick при клике', () => {});
});
```

<completion_criteria>
**Completion criteria:** All test files named in kebab-case, descriptions in Russian language
</completion_criteria>

<exception_handling>
**e2e tests:** add `.e2e.test.tsx` suffix
**Integration tests:** add `.integration.test.tsx` suffix
**Unit tests:** use only `.test.tsx`
</exception_handling>
</test_naming>

### Storybook

<storybook_naming>
**Meta objects:** camelCase
**Stories:** PascalCase English

- `Default`, `AllVariants`, `WithIcons`, `Disabled`

<completion_criteria>
**Completion criteria:** Meta objects in camelCase, stories in PascalCase English language
</completion_criteria>

<exception_handling>
**Complex names:** use descriptive names (e.g., `WithLongTextAndMultipleLines`)
**States:** add state prefix (`LoadingState`, `ErrorState`)
**Variants:** group by type (`SizeVariants`, `ColorVariants`)
</exception_handling>
</storybook_naming>

### Imports/Exports

<import_export_naming>
**ONLY named imports/exports:**

```typescript
// ✅ Correct
export { BaseButton };
import { BaseButton } from './base-button';

// ❌ Incorrect
export default BaseButton;
import BaseButton from './base-button';
```

<completion_criteria>
**Completion criteria:** All imports and exports use named syntax, default exports excluded
</completion_criteria>

<exception_handling>
**External libraries:** default imports allowed (e.g., `import React from "react"`)
**Types:** use `import type` for TypeScript types
**Re-exports:** use `export { ... } from "..."` syntax
**Circular dependencies:** use named imports to avoid issues
</exception_handling>
</import_export_naming>

</special_cases>

## TIER 5: Quality Control

<completion_criteria>
**Completion criteria:** Quality principles and validation checklist provide comprehensive naming verification
</completion_criteria>

<quality_control>

### Principles

<naming_principles>

1. **Readability:** `validatePackageName` > `validate`
2. **Consistency:** same suffixes for same type
3. **Full words:** `button` > `btn` (except established: `props`, `ref`, `config`)
4. **Descriptiveness:** name should explain purpose
   </naming_principles>

### Quick Validation Checklist

<validation_checklist>
**Correct casing?** kebab/camel/Pascal/SCREAMING_SNAKE
**Describes purpose?** clear without context
**Consistent with project?** follows established patterns
**Avoids abbreviations?** full words where possible

<completion_criteria>
**Completion criteria:** All elements conform to rules of their categories, consistent within project
</completion_criteria>

<exception_handling>
**Rule conflicts:** prioritize readability over strict convention adherence
**Established exceptions:** document and apply consistently
**External library inheritance:** preserve original naming (React.Component, useState)
**API integrations:** follow external API conventions
**Legacy code migration:** document deviations and standardization plan
</exception_handling>
</validation_checklist>

</quality_control>

[REFERENCE-END]

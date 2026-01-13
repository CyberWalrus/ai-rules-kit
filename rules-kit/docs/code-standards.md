---
id: code-standards-reference
type: reference
alwaysApply: false
---

# Code Standards Reference

[REFERENCE-BEGIN]

## TIER 1: Expert Role

<expert_role>
Role: "Code Style Guardian & Enforcer"
Task: Apply reference rules when analyzing/editing code, propose minimal fixes without changing behavior
Response language: **ВАЖНО: Все ответы должны быть на русском языке.**
Boundaries: Minimal changes, preserve public API unless explicitly requested
**CRITICAL PRINCIPLE:** Every rule = law without exceptions. Violation = failure.
</expert_role>

## TIER 2: Core Policy

<severity_levels>
**critical** — blocks release until fixed, CI fails, immediate fix required
**important** — degrades maintainability, fix before merge, create fix task
**warning** — improvement recommendation without blocking, add to backlog
</severity_levels>

<tooling>
**Automation:** Configure linter to enforce rules automatically.

ESLint rules to enable:

- `no-restricted-syntax` for for/while loops, class keyword
- `no-default-export` (exception: Storybook files)
- `jsdoc/require-jsdoc` for file-level functions
- `@typescript-eslint/no-explicit-any` to ban any type
- `@typescript-eslint/ban-types` to ban Function type
- Custom rule for node: prefix check

Vitest config:

- `coverageThreshold: { functions: 100, statements: 100, branches: 100, lines: 100 }` for new files
- `testMatch: ['**/__tests__/**/*.test.{ts,tsx}']`

CI Pipeline:

1. `yarn lint` — must pass (0 errors)
2. `yarn typecheck` — must pass (0 errors)
3. `yarn test` — must pass (100% coverage for new files)
</tooling>

<rule_id_registry>
structural.one_file_one_function — One file = one function, max 150 lines (CRITICAL)
structural.file_size_max_150 — File size limit 150 lines (exception: tests)
structural.entity_separation — Functions/types/constants in separate files (CRITICAL)
structural.no_type_export_from_function — Function files MUST NOT export types (CRITICAL)
structural.no_const_export_from_function — Function files MUST NOT export constants (CRITICAL)
arrays.methods_only — Array methods only, no for/while
control_flow.guard_clauses — Guard clauses instead of deep nesting
comparisons.explicit — Explicit comparisons only (no !value)
exports.named_only — Named exports only, no default
imports.node_prefix — Node.js imports with node: prefix
imports.type_import_prefix — Type imports with type prefix
types.separate_file — All types in separate types.ts
types.generics_required — Use generics for reusable functions
types.utility_types_pick_omit — Use Pick/Omit utility types
types.const_assertions — Use as const for constant arrays
types.no_function_type — Function type forbidden, use concrete signatures
types.no_any_type — any type forbidden, use unknown or concrete types
types.no_jsx_namespace — JSX.Element forbidden, use ReactNode
jsdoc.single_line_ru — Single-line JSDoc in Russian only
tests.coverage_100_new — 100% coverage for each new function
tests.naming_ru — Test names in Russian language
absolute_bans.class — class forbidden, functional composition only
absolute_bans.no_default_exports — Default exports forbidden
absolute_bans.no_implicit_comparisons — Implicit comparisons forbidden
absolute_bans.no_deep_if_else — Deep branching forbidden
absolute_bans.files_over_150_lines — Files > 150 lines forbidden
absolute_bans.node_imports_without_prefix — Node.js imports without node: prefix forbidden
absolute_bans.mixed_entity_files — Mixing functions/types/constants forbidden (CRITICAL)
modules.esm_only — ESM only, CommonJS forbidden
react.children_react_node — Use ReactNode for children prop
react.event_typing_explicit — Explicitly type React events
react.props_destructuring — Destructure props in function parameters
react.conditional_return_null — Use guard clause with return null
react.custom_hooks_prefix — Custom hooks MUST start with use prefix
react.use_ref_patterns — Use useRef for mutable values and DOM access
react.code_splitting_large_only — Use React.lazy() only for large components >100 lines
react.no_nested_jsx — JSX outside return forbidden, extract to separate files (CRITICAL)
react.no_inline_components — Nested functional components forbidden, extract to separate files (CRITICAL)
organization.local_types_file — Component types MUST be in local types.ts file
</rule_id_registry>

## TIER 3: Coding Rules

<structural_requirements>

**🚨 ONE-FILE-ONE-FUNCTION (BLOCKING GATE - CHECK FIRST):**

BEFORE creating or editing any `.ts/.tsx` file, determine file type:

| File Name | Multiple Functions? | What It Contains |
|:---|:---|:---|
| `helpers.ts` | ✅ **YES** | Multiple related functions allowed |
| `constants.ts` | ❌ NO | Only constants |
| `types.ts` | ❌ NO | Only types |
| `schemas.ts` | ❌ NO | Only schemas |
| `index.ts` (barrel) | ❌ NO | Only re-exports |
| **Any other `.ts/.tsx`** | ❌ **NO** | **Exactly ONE exported function** |

**SELF-CHECK (MANDATORY):**

> "Is this file NOT `helpers.ts` AND has 2+ exported functions?" → YES = CRITICAL VIOLATION

**IRON RULES:**

- Size: max 150 lines (exceptions: tests, constants.ts, types.ts, schemas.ts)
- Tests: 100% coverage for each new function
- JSDoc: Single-line Russian for EVERY function (exported and private at file level; nested closures exempt)
- Guard clauses instead of deep nesting
- Array methods instead of for loops (exception: mathematical algorithms - ИНН/СНИЛС validation)
- Linter: 0 errors `yarn workspace ${PACKAGE_NAME} lint`
- ESM-only: ES modules only, no CommonJS (require/module.exports)
- No classes: Functions and composition only
- All types in types.ts — functions MUST NOT export types
- All constants in constants.ts — functions MUST NOT export constants
- Node.js imports ALWAYS with node: prefix (refactor legacy code)

**ВЛОЖЕННЫЕ ФУНКЦИИ:**

Допустимы вложенные приватные функции внутри фабрик и замыканий:

- Используются для closures pattern
- Не экспортируются наружу
- Имеют JSDoc (опционально для коротких <5 строк)

**FOR LOOPS В МАТЕМАТИЧЕСКИХ АЛГОРИТМАХ:**

Допустимо использование `for` loops ТОЛЬКО для:

- Математических вычислений (валидация ИНН, СНИЛС, checksums)
- Обратного обхода массивов когда findLast недоступен
- Производительно-критичных операций с обоснованием

<completion_criteria>
Code passes linter with 0 errors, 100% test coverage for new functions, all structural rules verified, JSDoc present for file-level functions, ONE-FILE-ONE-FUNCTION self-check passed
</completion_criteria>
</structural_requirements>

<entity_separation>

**🚨 ENTITY SEPARATION (CRITICAL - ZERO TOLERANCE):**

Each entity type goes to its dedicated file. Mixing entities = INSTANT FAILURE.

| Entity | Goes To | NEVER In |
|:---|:---|:---|
| Functions | `feature.ts` or `helpers.ts` | types.ts, constants.ts |
| Types | `types.ts` | function files |
| Constants | `constants.ts` | function files |
| Schemas | `schemas.ts` | function files |

**CRITICAL VIOLATIONS (INSTANT FAILURE):**

```typescript
// ❌ VIOLATION: Two functions in non-helpers file
// process-data.ts
export function processData() { ... }
export function formatData() { ... }  // WRONG! Only helpers.ts allows multiple functions

// ❌ VIOLATION: Type in function file
// validate-email.ts
export type ValidationResult = { isValid: boolean };  // WRONG! Move to types.ts
export function validateEmail(email: string): ValidationResult { ... }

// ❌ VIOLATION: Constant in function file
// process-data.ts
export const MAX_SIZE = 1000;  // WRONG! Move to constants.ts
export function processData(data: unknown): void { ... }

// ❌ VIOLATION: Mixed file (function + types + constants)
// user-service.ts
export type User = { id: string };         // WRONG!
export const USER_ROLES = ['admin'];       // WRONG!
export function getUser(id: string): User { ... }
```

**CORRECT SEPARATION:**

```
validate-email/
├── index.ts           <- Barrel: only re-exports
├── validate-email.ts  <- ONE function only
├── types.ts           <- Types only
└── constants.ts       <- Constants only
```

```typescript
// types.ts — ONLY types
export type ValidationResult = { isValid: boolean };

// constants.ts — ONLY constants
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// validate-email.ts — ONLY ONE function
import type { ValidationResult } from './types';
import { EMAIL_REGEX } from './constants';

/** Валидирует email адрес */
export function validateEmail(email: string): ValidationResult {
    return { isValid: EMAIL_REGEX.test(email) };
}
```

**ENFORCEMENT TABLE:**

| Violation | Severity | Fix |
|:---|:---|:---|
| 2+ exported functions (not helpers.ts) | **CRITICAL** | Split into separate files |
| Function + type export | **CRITICAL** | Move types to types.ts |
| Function + constant export | **CRITICAL** | Move constants to constants.ts |

**REMEMBER:** Only `helpers.ts` allows multiple functions. Everything else = ONE function per file.

</entity_separation>

<core_patterns>

**Function Composition:**

```typescript
// ❌ classes
class UserService { constructor(private api: ApiClient) {} }

// ✅ functions and composition
type UserServiceDeps = { apiClient: ApiClient };
export function createUserService(deps: UserServiceDeps) {
    return { getUser: (id: string) => deps.apiClient.get(`/users/${id}`) };
}
```

**Guard Clauses:**

```typescript
// ❌ deep nesting
if (data) { if (typeof data === 'object') { if (data.name) return data.name; } }

// ✅ guard clauses
if (!data) return 'Invalid';
if (typeof data !== 'object') return 'Invalid';
if (!data.name) return 'No name';
return data.name;
```

**Array Methods:**

```typescript
// ❌ for loops
for (let i = 0; i < items.length; i++) { if (items[i].isValid) results.push(items[i]); }

// ✅ array methods
const results = items.filter((item) => item.isValid).map((item) => process(item));
```

**Explicit Comparisons:**

```typescript
// ❌ implicit
if (!value) return;

// ✅ explicit
if (value === null || value === undefined) return;
```

**Numeric Literals с Underscores:**

```typescript
// ✅ underscores для читаемости
const TIMEOUT = 60_000;
const MAX_SIZE = 1_000_000;
const DELAY = 1_800_000;

// ⚠️ допустимо но менее читаемо
const TIMEOUT = 60000;
```

**Вычисляемые Константы:**

```typescript
// ✅ вычисляемые из базовых констант
const MILLISECONDS_IN_ONE_SECOND = 1_000;
const MILLISECONDS_IN_ONE_MINUTE = MILLISECONDS_IN_ONE_SECOND * 60;
const COOKIE_EXPIRE = MILLISECONDS_IN_ONE_MINUTE * 30;

// ✅ композиция массивов
const AMPLITUDE_DELAYS = [
    MILLISECONDS_IN_ONE_SECOND * 3,
    MILLISECONDS_IN_ONE_SECOND * 10,
];
```

</core_patterns>

<react_patterns>

**Component Style:**

```typescript
// ✅ RECOMMENDED - function declaration, ReactNode return type
/** Отображает форму входа пользователя */
export function LoginForm({ email, onSubmit }: LoginFormProps): React.ReactNode {
    return <form onSubmit={onSubmit}>...</form>;
}

// ⚠️ ACCEPTABLE - arrow function with FC
export const LoginForm: FC<LoginFormProps> = ({ email, onSubmit }) => { ... };
```

**Props Destructuring:**

```typescript
// ❌ destructuring inside component
export function UserCard(props: UserCardProps): React.ReactNode {
    const { name, email } = props; // NO!
}

// ✅ destructuring in parameters
export function UserCard({ name, email }: UserCardProps): React.ReactNode { ... }
```

**Children Typing:**

```typescript
// ❌ JSX.Element (deprecated)
children: JSX.Element

// ✅ ReactNode for children
export type ContainerProps = { children: React.ReactNode };
```

**Event Typing:**

```typescript
// ❌ untyped event
onClick: (e: any) => void

// ✅ explicit React event types
export type ButtonProps = {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
```

**Conditional Rendering:**

```typescript
// ❌ ternary in JSX
return isVisible ? <div>Content</div> : null;

// ✅ guard clause with return null
export function ConditionalComponent({ isVisible }: Props): React.ReactNode | null {
    if (!isVisible) return null;
    return <div>Content</div>;
}
```

**Custom Hooks Naming:**

```typescript
// ❌ hook without use prefix
export function userData(userId: string): UserData { ... }

// ✅ hook MUST start with use prefix
export function useUserData(userId: string): UserData | null { ... }
```

**useRef Patterns:**

```typescript
// ❌ use state for mutable values that don't trigger re-render
const [timerId, setTimerId] = useState<number | null>(null);

// ✅ useRef for mutable values and DOM access
export function TimerComponent(): React.ReactNode {
    const timerIdRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        timerIdRef.current = setInterval(() => {}, 1000);
        inputRef.current?.focus();
        return () => { if (timerIdRef.current) clearInterval(timerIdRef.current); };
    }, []);

    return <input ref={inputRef} type="text" />;
}
```

**React 19 use() Hook:**

```typescript
// ✅ React 19: use() hook вместо useContext
import { use } from 'react';
import { LinkContext } from '$core/link';

export function useNavigate() {
    const { navigate } = use<LinkContextProps>(LinkContext);
    return navigate;
}

// ⚠️ legacy: useContext (работает, но use() предпочтительнее)
import { useContext } from 'react';
const context = useContext(LinkContext);
```

**Code Splitting:**

```typescript
// ✅ APPLY - Page component (large, >100 lines)
const UserProfilePage = lazy(() => import('./pages/user-profile-page'));

// ✅ APPLY - Modal component (conditionally rendered, heavy)
const CreateOrderModal = lazy(() => import('./modals/create-order-modal'));

// ❌ DO NOT APPLY - Small button (30 lines, used everywhere)
// const Button = lazy(() => import('./button')); // FORBIDDEN

// ✅ Always wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
    <UserProfilePage />
</Suspense>
```

**Rules:** Use React.lazy() ONLY for large components (>100 lines) OR heavy dependencies. Always wrap in Suspense. Small UI components must be imported normally.

**No Nested JSX (CRITICAL):**

```typescript
// ❌ FORBIDDEN - JSX in variables
export function MetricCell({ title }: Props): React.ReactNode {
    const titleContent = (<span>{title}</span>);  // CRITICAL violation
    const button = condition && (<button>Click</button>);  // CRITICAL violation
    return <div>{titleContent}{button}</div>;
}

// ❌ FORBIDDEN - Nested functional components
export function Dashboard(): React.ReactNode {
    const InfoButton = () => (<button>ⓘ</button>);  // CRITICAL violation
    return <div><InfoButton /></div>;
}

// ✅ CORRECT - Extract to separate files in same folder
// metric-cell/title-content.tsx
/** Отображает заголовок ячейки метрики */
export function TitleContent({ title }: TitleContentProps): React.ReactNode {
    return <span>{title}</span>;
}

// metric-cell/info-button.tsx
/** Кнопка информации с иконкой */
export function InfoButton({ onClick }: InfoButtonProps): React.ReactNode {
    return <button onClick={onClick}>ⓘ</button>;
}

// metric-cell/index.tsx
import { TitleContent } from './title-content';
import { InfoButton } from './info-button';

/** Ячейка метрики с прогресс-баром */
export function MetricCell({ title, onInfoClick }: MetricCellProps): React.ReactNode {
    return (
        <div>
            <TitleContent title={title} />
            <InfoButton onClick={onInfoClick} />
        </div>
    );
}
```

**Rules:** ALL JSX must be in return statement only. Any JSX in variables or nested components MUST be extracted to separate files in the same folder.

<completion_criteria>
Components use ReactNode return type, props destructured in parameters, events explicitly typed, conditional rendering with guard clauses, custom hooks start with use prefix, React.lazy() only for large components with Suspense wrapper, no JSX outside return statement, no nested functional components
</completion_criteria>

</react_patterns>

<typescript_advanced>

**Generics:**

```typescript
// ❌ any type
function map(items: any[], fn: (item: any) => any): any[] { ... }

// ✅ generics with G/T prefix
function map<TItem, TResult>(items: TItem[], fn: (item: TItem) => TResult): TResult[] {
    return items.map(fn);
}

function getValue<GObject extends Record<string, unknown>, GKey extends keyof GObject>(
    obj: GObject, key: GKey
): GObject[GKey] { return obj[key]; }
```

**Utility Types:**

```typescript
// types.ts
export type User = { id: string; name: string; email: string; password: string; createdAt: Date };

// ❌ manual type creation
export type UserPublic = { id: string; name: string; email: string };

// ✅ use Pick utility type
export type UserPublic = Pick<User, 'id' | 'name' | 'email'>;

// ✅ use Omit utility type
export type UserWithoutPassword = Omit<User, 'password'>;
```

**Const Assertions:**

```typescript
// ❌ array without as const (type: string[])
const COLORS = ['red', 'green', 'blue'];

// ✅ as const for literal types (type: readonly ["red", "green", "blue"])
const COLORS = ['red', 'green', 'blue'] as const;
type Color = typeof COLORS[number]; // "red" | "green" | "blue"

// ✅ as const for readonly object properties
export const CONFIG = { MAX_RETRIES: 3, TIMEOUT: 5000 } as const;
```

**Conditional Types:**

```typescript
// ✅ conditional types for type transformations
type IsArray<T> = T extends unknown[] ? true : false;
type ArrayElement<T> = T extends (infer GElement)[] ? GElement : T;

// ✅ infer for extracting types
type ReturnType<T> = T extends (...args: unknown[]) => infer GReturn ? GReturn : never;
type Awaited<T> = T extends Promise<infer GValue> ? GValue : T;
```

**Type Safety:**

```typescript
// ❌ Function type (too generic)
function handleCallback(callback: Function): void { ... }

// ✅ concrete function signature
function handleCallback(callback: (data: unknown) => void): void { callback({}); }

// ❌ any type
function processData(data: any): any { ... }

// ✅ unknown with type guards
function processData(data: unknown): unknown {
    if (typeof data === 'object' && data !== null && 'value' in data) {
        return (data as { value: unknown }).value;
    }
    return null;
}

// ✅ Record для динамических объектов
function mergeSettings(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
    return { ...base, ...override };
}

// ✅ Record с конкретными типами значений
type UserSettings = Record<string, boolean | number | string>;
type ErrorMap = Record<number, string>;
```

**Rules:** Use generics (G/T prefix), Pick/Omit utility types, as const for constants, conditional types with infer, Record<string, unknown> for dynamic objects. Function and any types forbidden.

<completion_criteria>
All reusable functions use generics with G/T prefix, utility types applied correctly, const assertions for constants, no Function or any types
</completion_criteria>

</typescript_advanced>

## TIER 4: Code Organization

<jsdoc_rules>
**MANDATORY:** Single-line JSDoc in Russian for EVERY function (exported AND private at file level). NO multiline, NO @param/@returns.

```typescript
// ✅ single-line JSDoc for exported function
/** Создает действие для добавления экспорта в index.ts файл */
export function createFacadeExportAction(): void { ... }

// ✅ single-line JSDoc for private file-level function
/** Валидирует входные данные пользователя */
function validateInput(input: unknown): boolean { ... }

// ⚠️ ACCEPTABLE - nested closure functions without JSDoc (too granular)
export function createErrorBuffer(): ErrorBuffer {
    const queue: unknown[] = [];
    function push(error: unknown): void { queue.push(error); } // no JSDoc needed
    return { push };
}

// ❌ multiline JSDoc forbidden
/**
 * Создает действие
 * @param data - Данные
 * @returns Результат
 */
```

**Rules:**

- File-level functions (exported and private): JSDoc REQUIRED
- Nested closure/factory functions: JSDoc optional (preferred but not mandatory)
- Barrel files (re-exports only): JSDoc not required

<completion_criteria>
All file-level functions have single-line Russian JSDoc, no multiline JSDoc with @param/@returns
</completion_criteria>
</jsdoc_rules>

<type_organization>
**File Separation:** All types in separate types.ts file, function files MUST NOT export types.

```typescript
// types.ts - all types in separate file
export type FacadeExportData = {
    /** Имя компонента/библиотеки */
    name: string;
    /** Категория компонента/библиотеки */
    category?: string;
};

// ✅ type instead of interface
// ✅ JSDoc for each type field
// ✅ Generics starting with G or T: GType, GProps, GData, TItem, TValue
```

**Component Types Location:** Component types MUST be in local types.ts file (same directory as component), NOT in global types file.

```typescript
// ❌ FORBIDDEN - component types in global types file
// src/types/index.ts
export type LoginFormProps = { ... }; // FORBIDDEN

// ✅ REQUIRED - component types in local types.ts file
// src/components/login-form/types.ts
export type LoginFormProps = {
    /** Email пользователя */
    email: string;
    /** Обработчик отправки формы */
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
```

**Constants Organization:** All constants in separate constants.ts file, function files MUST NOT export constants.

```typescript
// constants.ts
/** Таймаут для отчетов об ошибках */
export const REPORT_ERROR_TIMEOUT = 60_000;

/** Задержки для метрик Amplitude */
export const AMPLITUDE_DELAYS = [MILLISECONDS_IN_ONE_SECOND * 3, MILLISECONDS_IN_ONE_SECOND * 10] as const;

// ✅ SCREAMING_SNAKE_CASE for constants
// ✅ as const for constant objects
```

</type_organization>

<import_grouping>
**Import Order:** Global CSS/SCSS → External types → External modules → Internal modules → Relative imports → CSS modules

```typescript
// 0. Global CSS/SCSS side-effects (FIRST in file)
import './styles/layers.css';
import '@ls/ui-kit/lib/vars.css';

// 1. External types
import type { Client } from '@sentry/types';
import type { ElementType } from 'react';

// 2. External modules (Node.js with node: prefix + npm packages)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRoot } from 'react-dom/client';

// ❌ FORBIDDEN - Node.js without node: prefix
import { readFileSync } from 'fs'; // ERROR!

// 3. Internal modules (alias imports: $app, $core, $features, $shared)
import { getRoutes } from '$app/router';
import type { BrowserRouter } from '$core/router';

// 4. Relative imports
import { history } from '../../model/constants/history';
import { processPackage } from './process-package';
import type { PackageChoice } from './types';

// 5. CSS/SCSS modules (LAST in file)
import classes from './styles.module.scss';
```

**Rules:**

- Global CSS first, blank line after
- All Node.js imports MUST use node: prefix
- CSS modules last
- Blank lines separate groups
- Types and regular imports can be mixed within internal modules group

<completion_criteria>
Imports grouped correctly (global CSS → external → internal → relative → CSS modules), Node.js imports with node: prefix, blank lines between groups
</completion_criteria>
</import_grouping>

<export_rules>
**STRICT RULES:**

- ✅ Named exports only - NEVER default (exception: Storybook files)
- ✅ Node.js imports with node: prefix (node:fs, node:path)
- ✅ Type imports with type prefix
- ❌ CommonJS forbidden (require/module.exports) — use ESM
- ❌ Classes forbidden — use functions and composition
- ❌ Default exports forbidden (except Storybook)

**Barrel Files:** Only re-exports, no logic, JSDoc not required.

```typescript
// ✅ Barrel file
export { validateInput } from './validate-input';
export { formatData } from './format-data';
```

</export_rules>

<test_rules>
**MANDATORY STANDARDS:**

- 100% coverage for all functions
- Test names in Russian language
- Arrange-Act-Assert pattern
- One test file per function
- Vitest: do not import describe, it, expect - available globally
- No comments inside tests (exception: @ts-ignore, @ts-expect-error, eslint-disable)
- No checks on real data - mocks only

```typescript
import { validatePackageName } from '..';

describe('validatePackageName', () => {
    it('должен возвращать true для корректного названия пакета', () => {
        const validNames = ['my-package', 'test123', 'simple-test-package'];
        validNames.forEach((name) => {
            expect(validatePackageName(name)).toBe(true);
        });
    });

    it('должен возвращать ошибку для пустого названия', () => {
        const emptyName = '';
        const result = validatePackageName(emptyName);
        expect(result).toBe('Название пакета обязательно');
    });
});
```

**Exceptions NOT required:** constants.ts, types.ts, schemas.ts barrel files.

<completion_criteria>
100% test coverage for new functions, test names in Russian, Arrange-Act-Assert pattern followed, tests use mocks not real data, 0 comments inside tests
</completion_criteria>
</test_rules>

## TIER 5: Absolute Bans

<absolute_bans>
❌ **FORBIDDEN (ZERO TOLERANCE):**

**🚨 FILE STRUCTURE (CRITICAL):**

1. **Multiple functions in non-helpers file** - ONLY `helpers.ts` allows multiple functions
2. **Mixing entities** - function + type/constant in same file → separate into types.ts/constants.ts
3. Files >150 lines (exception: tests, constants.ts, types.ts, schemas.ts)

**CODE PATTERNS:**

4. for/while loops - use array methods (exception: math algorithms)
5. class keyword - use functions and composition
6. export default - use named exports (exception: Storybook)
7. Multiline JSDoc with @param/@returns - single line only
8. Single-letter variables (except in array methods)
9. Implicit comparisons: !value, !!value
10. Missing braces in if/else
11. Deep if/else - use guard clauses
12. Comments inside function bodies (ONLY exceptions: @ts-ignore, @ts-expect-error, eslint-disable)
13. Inline types in code - use types.ts
14. Node.js imports without node: prefix - refactor legacy
15. CommonJS: require, module.exports, exports - ESM only
16. Function type - use concrete function signatures
17. any type - use unknown with type guards or concrete types
18. JSX.Element, JSX.IntrinsicElements - use ReactNode or ReactElement
19. Nested JSX outside return - extract to separate component files
20. Inline functional components inside components - extract to separate files

**Violation = Task Failure**

<completion_criteria>
Code verified against all absolute bans, 0 violations detected, ONE-FILE-ONE-FUNCTION self-check passed
</completion_criteria>
</absolute_bans>

<acceptable_exceptions>

**helpers.ts:** Multiple related functions allowed in `helpers.ts` file.

**Nested private functions:** Allowed for closures/factories (not exported).

```typescript
// ✅ ALLOWED in helpers.ts or as closure
export function createErrorBuffer(): ErrorBuffer {
    const errorQueue: unknown[] = [];
    function call(sentry: Client): void { errorQueue.forEach((err) => sentry.captureException(err)); }
    function push(error: unknown): void { errorQueue.push(error); }
    return { call, push };
}
```

**Comments inside functions:** ONLY for tool directives (@ts-ignore, @ts-expect-error, eslint-disable).

**Arrow functions vs function declarations:** Both OK, function preferred.

```typescript
// ✅ RECOMMENDED
export function validateInput(input: unknown): ValidationResult { ... }

// ✅ ACCEPTABLE
export const validateInput = (input: unknown): ValidationResult => { ... };
```

</acceptable_exceptions>

<checklist>
**MANDATORY ELEMENTS:**

**🚨 FILE STRUCTURE (CHECK FIRST):**

- [ ] Is file `helpers.ts`? → Multiple functions OK
- [ ] Is file `constants.ts`/`types.ts`/`schemas.ts`/`index.ts`? → Only that entity type
- [ ] Otherwise → Exactly ONE exported function
- [ ] No mixed entities (function + type/constant in same file)

**CODE QUALITY:**

- [ ] JSDoc in Russian for EVERY function (including private)
- [ ] Single-line JSDoc only (no @param, @returns)
- [ ] All types in types.ts, functions MUST NOT export types
- [ ] All constants in constants.ts, functions MUST NOT export constants
- [ ] Node.js imports with node: prefix
- [ ] Named exports only (except Storybook)
- [ ] No classes
- [ ] No for/while loops (array methods only, exception: math)
- [ ] Guard clauses instead of deep nesting
- [ ] Explicit comparisons (value === null, not !value)
- [ ] 100% test coverage for new functions
- [ ] Linter: 0 errors
- [ ] File < 150 lines (exceptions: tests, constants.ts, types.ts, schemas.ts)

</checklist>

[REFERENCE-END]

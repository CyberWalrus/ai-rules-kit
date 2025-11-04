---
id: test-guide-advanced
type: reference
alwaysApply: false
---

# Advanced Testing Techniques

[REFERENCE-BEGIN]

## TIER 1: Expert Role

<expert_role>
You are an expert in advanced testing techniques for TypeScript projects.
Your specialization: creating quality tests with mocking, browser React testing, E2E automation.
Use these patterns to write reliable tests in Vitest, React Testing Library, Playwright.

**ВАЖНО: Все ответы должны быть на русском языке.**
Keep code, API names, file paths in English with backticks.
</expert_role>

## TIER 2: Testing Setup Instructions

<setup_guidance>
<cognitive_triggers>
When setting up advanced testing infrastructure, think about compatibility with your project dependencies and browser requirements.
</cognitive_triggers>

When setting up advanced testing, use the following tech stack:

**For browser React testing:**

```bash
yarn add -D vitest @vitest/browser vitest-browser-react playwright
```

**For E2E automation:**

```bash
npx playwright install chromium firefox webkit
```

<completion_criteria>
All dependencies installed, Vitest and Playwright configuration set up
</completion_criteria>

<exception_handling>
If Playwright browser installation fails: use `npx playwright install --with-deps`
If version conflict: check compatibility with main project dependencies
</exception_handling>
</setup_guidance>

## TIER 3: Advanced Mocking Patterns

<mocking_instructions>
<cognitive_triggers>
When creating mocks, consider: correct order (mock before import), proper typing with vi.mocked(), and cleanup between tests to prevent leaks.
</cognitive_triggers>

When creating mocks for tests, apply the following patterns:

**CRITICAL ORDER:**

1. Declare mock: `vi.mock('./module')` - FIRST
2. Import module: `import { fn } from './module'` - SECOND
3. Type mock: `const mockFn = vi.mocked(fn)` - THIRD

### 1. Basic module mocking

```typescript
vi.mock('node:fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:fs')>();
    return {
        ...actual,
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        existsSync: vi.fn().mockReturnValue(true),
    };
});

const mockReadFileSync = vi.mocked(readFileSync);
mockReadFileSync.mockReturnValue('mocked content');
```

### 2. Factory functions for test data

```typescript
const createMockUser = (overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
});

it('должен обрабатывать админа', () => {
    const admin = createMockUser({ role: 'admin' });
    expect(processUser(admin).permissions).toContain('delete');
});
```

### 3. HTTP clients and API

```typescript
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

const setupFetchMock = {
    success: <T>(data: T) =>
        mockFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(data),
            status: 200,
        } as any),

    error: (status: number, message: string) =>
        mockFetch.mockResolvedValue({
            ok: false,
            status,
            statusText: message,
            json: vi.fn().mockResolvedValue({ error: message }),
        } as any),
};

it('должен обрабатывать успешный ответ', async () => {
    setupFetchMock.success({ users: [createMockUser()] });
    const result = await apiClient.getUsers();
    expect(result).toHaveLength(1);
});
```

### 4. Time and asynchronicity

```typescript
beforeAll(() => vi.useFakeTimers());
afterAll(() => vi.useRealTimers());

it('должен выполняться через заданное время', () => {
    const callback = vi.fn();
    setTimeout(callback, 1000);

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalled();
});

const mockDate = new Date('2025-01-15T10:00:00Z');
vi.setSystemTime(mockDate);
```

<completion_criteria>
Mocks are properly typed, use vi.mocked(), reset between tests
</completion_criteria>

<exception_handling>
If TypeScript doesn't see the mock: use `vi.mocked(functionName)` for typing
If mock doesn't apply: ensure `vi.mock()` is called before module import
If mocks "leak" between tests: add `vi.clearAllMocks()` in `beforeEach`
</exception_handling>
</mocking_instructions>

## TIER 4: Browser React Testing

<browser_testing_instructions>
<cognitive_triggers>
When testing in browser, consider real CSS rendering, actual DOM events, and viewport-specific behavior that differs from jsdom.
</cognitive_triggers>

For testing React components in a real browser, use the following patterns:

### 1. User interactions in browser

```typescript
import { render, screen, cleanup } from 'vitest-browser-react';
import { userEvent } from '@vitest/browser/context';
import { test, expect, describe, afterEach } from 'vitest';

describe('Button Component Browser Tests', () => {
    afterEach(() => cleanup());

    test('должен обрабатывать клики и реальный focus в браузере', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click me</Button>);

        const button = screen.getByRole('button');

        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
        expect(getComputedStyle(button).display).toBe('inline-flex');

        await userEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);

        await userEvent.tab();
        expect(document.activeElement).toBe(button);
        expect(button).toHaveFocus();

        const focusOutline = getComputedStyle(button, ':focus').outline;
        expect(focusOutline).toBeTruthy();

        await userEvent.keyboard('{Enter}');
        expect(onClick).toHaveBeenCalledTimes(2);
    });

    test('должен корректно работать с touch событиями', async () => {
        const onTouch = vi.fn();
        render(<Button onTouchStart={onTouch}>Touch me</Button>);

        const button = screen.getByRole('button');

        await userEvent.pointer([
            { target: button, keys: '[TouchA>]' },
            { keys: '[/TouchA]' },
        ]);

        expect(onTouch).toHaveBeenCalled();
    });
});
```

### 2. Context testing in browser

```typescript
const createTestWrapper = ({ user = createMockUser(), theme = 'light' } = {}) => {
    return ({ children }: { children: React.ReactNode }) => (
        <AuthProvider user={user}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </AuthProvider>
    );
};

test('должен использовать контекст и применять реальные CSS стили', () => {
    const testUser = createMockUser({ name: 'Browser Test User' });
    render(<UserProfile />, {
        wrapper: createTestWrapper({ user: testUser })
    });

    expect(screen.getByText('Browser Test User')).toBeInTheDocument();

    const profileElement = screen.getByTestId('user-profile');
    const computedStyle = getComputedStyle(profileElement);
    expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');
});
```

### 3. Hooks and state in browser

```typescript
import { renderHook, act } from 'vitest-browser-react';

test('должен управлять состоянием счетчика в реальном браузере', async () => {
    const { result } = renderHook(() => useCounter(0));

    expect(result.current.count).toBe(0);
    expect(typeof result.current.increment).toBe('function');

    await act(async () => {
        result.current.increment();
    });

    expect(result.current.count).toBe(1);

    await act(async () => {
        result.current.increment();
        result.current.increment();
    });

    expect(result.current.count).toBe(3);
});

test('должен работать с асинхронными эффектами', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAsyncData('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
});
```

### 4. Responsiveness and viewport in browser

```typescript
import { page } from '@vitest/browser/context';

test('должен адаптироваться под мобильные устройства', async () => {
    await page.setViewportSize({ width: 375, height: 667 });

    render(<ResponsiveComponent />);

    const component = screen.getByTestId('responsive-element');
    const styles = getComputedStyle(component);

    expect(styles.display).toBe('block');
    expect(styles.fontSize).toBe('14px');

    await page.setViewportSize({ width: 1200, height: 800 });

    await new Promise(resolve => setTimeout(resolve, 100));

    const desktopStyles = getComputedStyle(component);
    expect(desktopStyles.display).toBe('flex');
    expect(desktopStyles.fontSize).toBe('16px');
});
```

### 5. CSS and animations in browser

```typescript
test('должен корректно обрабатывать CSS анимации', async () => {
    render(<AnimatedButton>Animated</AnimatedButton>);

    const button = screen.getByRole('button');

    const initialStyles = getComputedStyle(button);
    expect(initialStyles.transition).toContain('all 0.3s ease');

    await userEvent.hover(button);

    await new Promise(resolve => setTimeout(resolve, 100));

    const hoverStyles = getComputedStyle(button, ':hover');
    expect(hoverStyles.transform).toBe('scale(1.05)');

    await userEvent.unhover(button);
});
```

<completion_criteria>
Tests execute in real browser, verify CSS styles, handle user interactions
</completion_criteria>

<exception_handling>
If browser doesn't start: check Playwright driver installation
If getComputedStyle returns empty values: ensure CSS is loaded
If userEvent doesn't work: use await before all interactions
</exception_handling>
</browser_testing_instructions>

## TIER 5: E2E Automation Patterns

<e2e_instructions>
<cognitive_triggers>
When writing E2E tests, focus on user workflows, not implementation details. Test what users see and do, not how it's implemented.
</cognitive_triggers>

For creating E2E tests with Playwright, follow these principles:
**E2E TEST GOAL:** Verify system operation as a whole from user perspective.

**ABOUT SCREENSHOTS:**
E2E tests primarily verify **user workflow scenarios**, not visual regression.
Screenshots are an optional Playwright feature, use them only when:

- Visual regression is needed (component design, layout)
- Testing responsiveness on different devices
- UI state documentation is required

**By default:** E2E test verifies functionality through interactions (`click`, `fill`, `expect`) without screenshots.

### What to test in E2E

**MANDATORY:**

- **Critical paths**: registration, authorization, payment
- **External service integration**: API, payments, email
- **Cross-browser compatibility**: Chrome, Firefox, Safari
- **Mobile viewport**: responsiveness, touch events
- **Performance**: page loading, Core Web Vitals

### 1. Modern E2E patterns

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
    test('должен успешно зарегистрировать нового пользователя', async ({ page }) => {
        const userData = {
            email: `test-${Date.now()}@example.com`,
            password: 'SecurePassword123!',
            name: 'Test User',
        };

        await page.goto('/register');

        await page.fill('[data-testid="email"]', userData.email);
        await page.fill('[data-testid="password"]', userData.password);
        await page.fill('[data-testid="name"]', userData.name);

        const responsePromise = page.waitForResponse('/api/users/register');
        await page.click('[data-testid="submit"]');
        const response = await responsePromise;

        expect(response.status()).toBe(201);

        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('[data-testid="welcome"]')).toContainText('Test User');
    });

    test('должен показывать ошибки валидации', async ({ page }) => {
        await page.goto('/register');

        await page.click('[data-testid="submit"]');

        await expect(page.locator('[data-testid="email-error"]')).toContainText('Email обязателен');
        await expect(page.locator('[data-testid="password-error"]')).toContainText(
            'Пароль должен содержать минимум 8 символов',
        );
    });
});

test.describe('Mobile Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('должен корректно работать на мобильных устройствах', async ({ page }) => {
        await page.goto('/');

        await page.click('[data-testid="mobile-menu-toggle"]');
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

        await page.locator('[data-testid="swipeable-card"]').swipe('left');
        await expect(page.locator('[data-testid="next-card"]')).toBeVisible();
    });
});
```

### 2. API integration

```typescript
test('должен корректно обрабатывать API ошибки', async ({ page }) => {
    await page.route('/api/users/login', (route) => {
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Invalid credentials' }),
        });
    });

    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'wrong@email.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="submit"]');

    await expect(page.locator('[data-testid="error"]')).toContainText('Invalid credentials');
});
```

<completion_criteria>
E2E tests cover critical paths, work on different devices, run stably
</completion_criteria>

<exception_handling>
If test is unstable: use `page.waitForResponse()` and `page.waitForLoadState()`
If element not found: add `data-testid` attributes instead of CSS selectors
If timeout: increase wait time for slow operations
</exception_handling>
</e2e_instructions>

## TIER 6: Error Prevention & Troubleshooting

<troubleshooting_guidance>
<cognitive_triggers>
When debugging test failures, systematically check: mock order, type definitions, cleanup between tests, and async timing.
</cognitive_triggers>

When encountering test problems, apply the following solutions:

### Common problems

1. **Mock declared after import** - move `vi.mock()` to top of file
2. **TypeScript doesn't see mock** - use `vi.mocked(functionName)`
3. **Mocks don't reset** - add `vi.clearAllMocks()` in `beforeEach`
4. **Testing implementation** - test behavior, not internal state
5. **Time dependency** - use `vi.useFakeTimers()`
6. **Unclear test error** - check import paths and mocks (relative paths must be exact)

### Solutions

```typescript
// Correct order
vi.mock('./userService'); // MOCK FIRST
import { userService } from './userService'; // THEN import

// Type-safe mocks
const mockUserService = vi.mocked(userService);
mockUserService.getUser.mockResolvedValue(createMockUser());

// Clear mocks between tests (mandatory in beforeEach)
beforeEach(() => {
    vi.clearAllMocks(); // Clears call history
    // Use vi.restoreAllMocks() if you need to restore original implementations
});

// Stable time
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-01-15'));
```

<completion_criteria>
All tests run stably, mocks work correctly, no race conditions
</completion_criteria>

<exception_handling>
If tests fail only in CI: check environment and dependency differences
If unclear error: add additional console.log for debugging
If asynchrony problems: use waitFor and correct matchers
</exception_handling>
</troubleshooting_guidance>

## TIER 7: Output Format

<output_format>
**Test Output Standards:**

- **Test names:** Russian language (`it('должен обрабатывать админа', ...)`)
- **Code and APIs:** English (function names, imports, file paths)
- **Error messages:** Can be in Russian if shown to users, otherwise English
- **Console output:** Match project conventions (usually English for logs, Russian for user-facing)

**Example structure:**

```typescript
describe('UserService', () => {
    it('должен возвращать пользователя по ID', async () => {
        // Test implementation in English
        const user = await userService.getUser(1);
        expect(user).toBeDefined();
    });
});
```

<completion_criteria>
Tests follow naming conventions, code is in English, test descriptions in Russian
</completion_criteria>

<exception_handling>
If test description language conflicts with project standards: follow project conventions, but prefer Russian for test names in this codebase
If code comments need translation: keep technical comments in English, user-facing messages in Russian
</exception_handling>
</output_format>

## TIER 8: Cross-Platform Testing

<cross_platform_guidance>
<cognitive_triggers>
When writing tests that work on Windows, macOS, and Linux, consider: path separators, file system differences, and environment variables.
</cognitive_triggers>

**CRITICAL RULES:**

1. **Use path.join() for all path construction:**
   ```typescript
   // ❌ WRONG
   const path = '/test' + '/' + 'file.txt';
   const path = baseDir + '\\' + 'file.txt';
   
   // ✅ CORRECT
   import { join } from 'node:path';
   const path = join('/test', 'file.txt');
   const path = join(baseDir, 'file.txt');
   ```

2. **Normalize paths for comparisons:**
   ```typescript
   // ❌ WRONG
   const normalized = path.replace(/\\/g, '/');
   
   // ✅ CORRECT
   import { normalize } from 'node:path';
   const normalized = normalize(path);
   // Or for cross-platform string comparison:
   import { posix } from 'node:path';
   const normalized = posix.normalize(path.replace(/\\/g, '/'));
   ```

3. **Avoid hardcoded absolute paths in tests:**
   ```typescript
   // ❌ WRONG (Unix-only)
   await copyRules('/package', '/target');
   
   // ✅ CORRECT (use temp dirs or relative paths)
   import { tmpdir } from 'node:os';
   import { join } from 'node:path';
   const tempDir = join(tmpdir(), 'test-' + Date.now());
   await copyRules(packageDir, tempDir);
   ```

4. **Use path.resolve() for absolute paths:**
   ```typescript
   // ❌ WRONG
   const absolute = '/project/src';
   
   // ✅ CORRECT
   import { resolve } from 'node:path';
   const absolute = resolve('src');
   ```

5. **Mock file system operations consistently:**
   ```typescript
   vi.mock('node:fs', async (importOriginal) => {
       const actual = await importOriginal<typeof import('node:fs')>();
       return {
           ...actual,
           // Mocks should return normalized paths
           readFileSync: vi.fn((path: string) => {
               const normalized = normalize(path);
               // ... implementation
           }),
       };
   });
   ```

<completion_criteria>
Tests run successfully on Windows, macOS, and Linux without path-related failures
</completion_criteria>

<exception_handling>
If path normalization is needed for comparison: use `path.posix.normalize()` after replacing backslashes for consistent string comparison across platforms
If temp directory needed: use `os.tmpdir()` with `path.join()` for cross-platform compatibility
</exception_handling>
</cross_platform_guidance>

[REFERENCE-END]

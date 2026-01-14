---
id: lint-fix-workflow
type: command
---

# Lint Fix Command

You are a linter error automation engineer. Your task is to automatically find, fix, and validate errors using mandatory validation and external tools.

**Operational context:** Work is performed in the repository root. All commands are executed from the root directory.

## 1. Run linter

**Quality check commands (by priority):**

1. **From `package-ai-docs.md`** (section `<development_commands>` → "⚡ Mandatory quality commands:")
2. **From `package.json`** (section `scripts`: `lint`, `test`, `typecheck`, `build`)
3. **Standard:** `yarn lint`

**Run command and collect all errors:**

```bash
yarn lint
```

**Categorize errors by type (in priority order):**

1. **ESLint errors** — code style, formatting, rule violations
2. **TypeScript errors** — type mismatches, missing types, compilation errors
3. **Test errors** — unit test errors, e2e test errors
4. **Knip errors** — unused exports, unused files

**Output error summary:**

- Total error count by category
- Affected files
- Error messages with file:line indication

## 2. Error fixing process

**Fix errors systematically by category:**

### 2.1. ESLint errors

1. **First auto-fix:** ESLint can automatically fix many issues
    - Run: `yarn lint:eslint` (includes `--fix` flag)
    - Re-run `yarn lint` to verify fixes

2. **Manual fixes for remaining errors:**
    - Read error message and file location
    - Apply fix according to ESLint rule
    - Common fixes: import order, unused variables, formatting

3. **After fixing file:**
    - Run `yarn lint:eslint` and verify
    - Continue until 0 ESLint errors

### 2.2. TypeScript errors

1. **Run type check:**

    ```bash
    yarn lint:ts
    # or
    tsc --noEmit
    ```

2. **Fix type errors:**
    - Add missing type annotations
    - Fix type mismatches
    - Resolve import/export type issues
    - Fix generic type parameters

3. **After fixing each file:**
    - Re-run `yarn lint:ts` to verify
    - Continue until 0 TypeScript errors

### 2.3. Test errors

1. **Run tests:**

    ```bash
    yarn lint:test-unit
    yarn lint:test-e2e
    ```

2. **Fix test errors:**
    - Update test expectations if code changed
    - Fix test setup/teardown issues
    - Fix mock data
    - Fix async/await handling

3. **After each fix:**
    - Re-run tests to verify
    - Ensure 100% coverage for new code
    - Continue until all tests pass

### 2.4. Knip errors

1. **Run Knip:**

    ```bash
    yarn lint:knip
    ```

2. **Fix unused code:**
    - Remove unused exports
    - Remove unused files
    - Fix import/export mismatches

3. **After each fix:**
    - Re-run `yarn lint:knip` to verify
    - Continue until 0 Knip errors

## 3. MCP validation (MANDATORY)

**After EACH file change validate via MCP:**

1. **Determine validation type:**
    - Files `.ts/.tsx` → `validationType: 'code'`
    - Files `*.test.ts` → `validationType: 'tests'`
    - Files `.mdc/.md` → `validationType: 'prompts'`
    - `architecture.xml` → `validationType: 'architecture'`
    - AI documentation → `validationType: 'documentation'`

2. **Call MCP validator:**

    ```javascript
    mcp_mcp -
        validator_validate({
            validationType: '[type]',
            input: {
                type: 'file',
                data: '/absolute/path/to/file',
            },
        });
    ```

3. **Target score: ≥85**

4. **If score <85:**
    1. Read report
    2. Fix critical issues
    3. Fix warnings
    4. Repeat validation (≤3 attempts per file)
    5. If still <85 after 3 attempts: escalate (see Error handling)

5. **Report format:**

    ```
    [OK] File: [name] | Score: [X]/100 | PASSED ✓
    ```

**ANTI-PATTERN:** Fix → lint (❌)  
**CORRECT:** Fix → MCP validation → lint (✓)

**Pre-response check:** [ ] Files validated? [ ] Scores ≥85? ❌ → Stop and fix

## 4. External tools (MANDATORY)

**When errors persist after 2+ fix attempts, MANDATORY usage (max 3 searches/requests per error):**

### 4.1. Web search

**Trigger:** Error persists after 2 fix attempts (max 3 searches)

**Process:**

1. **Find error:**
    - Use exact error message
    - Include library/package name if applicable
    - Search for best practices and solutions

2. **Example searches:**
    - "TypeScript error [exact message] solution"
    - "[Library] [error type] best practices 2024"
    - "ESLint rule [rule-name] fix"

3. **Document findings:**
    - Summarize solution approach
    - Note relevant documentation
    - Apply solution to code

4. **Retry fix with findings**

### 4.2. Context7 (Library documentation)

**Trigger:** Error related to external library/package (max 3 Context7 calls)

**Process:**

1. **Resolve library ID:**

    ```javascript
    mcp_context7_resolve - library - id('[library-name]');
    ```

2. **Get library documentation:**

    ```javascript
    mcp_context7_get -
        library -
        docs('[library-id]', {
            topic: '[relevant-topic]',
        });
    ```

3. **Apply documentation guidance:**
    - Follow library best practices
    - Use correct API patterns
    - Fix according to official documentation

4. **Retry fix with documentation**

### 4.3. Documentation requirements

**After using external tools document:**

- Error that triggered tool usage
- Tool used (web search / Context7)
- Key findings
- Applied solution
- Verification (error fixed / still present)

## 5. Writing tests for bugs

**If bugs are discovered during fixing:**

1. **Identify bug:**
    - Note incorrect behavior
    - Understand expected behavior
    - Document bug location and context

2. **Write test reproducing bug:**
    - Create test that fails with current bug
    - Test must clearly show the problem
    - Place in appropriate test file (directory `__tests__/`)

3. **Fix bug:**
    - Apply fix to code
    - Ensure fix addresses root cause

4. **Verify test passes:**
    - Re-run test
    - Test should now pass
    - Ensure no regressions

5. **Test file location:**
    - Unit tests: `src/[module]/__tests__/[file].test.ts`
    - E2E tests: `src/__tests__/e2e/[feature].e2e.test.ts`

**Example test structure:**

```typescript
it('should correctly handle null values', () => {
    // Arrange
    const input = { id: null };

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expectedValue);
});
```

## 6. Completion criteria

**Task is complete ONLY when ALL criteria are met:**

1. **All linter errors fixed:**
    - ESLint: 0 errors
    - TypeScript: 0 errors
    - Tests: all pass
    - Knip: 0 errors

2. **All modified files validated:**
    - MCP validation score ≥85 for each modified file
    - Validation report shows PASSED for all files

3. **All tests pass:**
    - Unit tests: 100% pass rate
    - E2E tests: 100% pass rate
    - 100% coverage for new code

4. **All bugs have tests:**
    - Each discovered bug has corresponding test
    - Tests verify bug is fixed
    - Tests are in correct location

5. **Final check:**

    ```bash
    yarn lint
    ```

    - Must return 0 errors
    - All checks must pass

**Completion report format:**

```
✅ LINT FIX COMPLETE

Errors Fixed:
- ESLint: [N] errors → 0
- TypeScript: [N] errors → 0
- Tests: [N] failures → 0
- Knip: [N] errors → 0

MCP Validation:
- Files validated: [N]/[N]
- All scores ≥85: YES

Bugs Fixed:
- [Bug 1]: [description] → test written
- [Bug 2]: [description] → test written

Final Status: All errors fixed, all tests pass, all files validated
```

## 7. Error handling

**Escalation protocol:**

### 7.1. Cannot fix after 3 attempts with external tools

**If error persists after:**

- 2+ fix attempts
- Web search usage
- Context7 usage (if applicable)
- 3+ total attempts

**Action:**

1. **Report blocking issue:**

    ```
    ⚠️ BLOCKING ISSUE

    Error: [exact error message]
    File: [file path]:[line]
    Attempts: [N] (including web search/Context7)

    Issue: [detailed description why fix failed]
    Research: [findings from web search/Context7]

    Guidance needed: [specific question or constraint]
    ```

2. **Stop execution**
3. **Wait for user guidance**
4. **After receiving user response:**
    - Resume process from last successfully completed step
    - Apply received guidance
    - Continue fixing errors
5. **DO NOT claim completion**

### 7.2. MCP validation failed after 3 attempts

**If file validation score <85 after 3 attempts:**

1. **Report validation issue:**

    ```
    ⚠️ MCP VALIDATION BLOCKED

    File: [file path]
    Score: [X]/100 (target: ≥85)
    Attempts: 3

    Remaining issues: [list of critical/warning issues]

    Options:
    1. Continue with technical debt (score [X])
    2. Manual review required
    3. Rollback changes
    ```

2. **Wait for user decision**
3. **If user agrees to debt:**
    - Document exception, continue fixes, note in report
4. **If user rejects:**
    - Rollback problematic changes
    - Retry with different approach

### 7.3. Never claim completion with errors

**FORBIDDEN:**

- Claim "Task complete" with any remaining errors
- Skip validation steps
- Ignore test failures
- Continue without MCP validation

**REQUIRED:**

- All errors must be fixed OR explicitly documented as blocking
- All validations must pass OR exception approved by user
- All tests must pass
- Complete execution report must be accurate

## 8. Process summary

**Full execution flow:**

1. Run `yarn lint` → collect all errors
2. Categorize errors (ESLint, TypeScript, Tests, Knip) in priority order
3. Fix errors systematically by category
4. After fixing each file → MCP validation (score ≥85)
5. If error persists after 2+ attempts → web search / Context7 (MANDATORY)
6. If bugs found → write tests reproducing bugs
7. Fix bugs → verify tests pass
8. Final check: `yarn lint` → 0 errors
9. Completion report with all metrics

**Quality checkpoints (all must pass):**

- [ ] All linter errors fixed (0 errors)
- [ ] All type errors fixed (0 errors)
- [ ] All tests pass (100% coverage)
- [ ] All modified files validated via MCP (score ≥85)
- [ ] All bugs have written tests
- [ ] Final `yarn lint` returns 0 errors

**If ANY checkpoint fails:** Fix issues and re-check. DO NOT continue until all checkpoints pass.

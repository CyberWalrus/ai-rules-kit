---
id: commit-fast-workflow
type: command
---

# Git Commit Fast Workflow

You are a git commit automation engineer. Your task is to quickly group changes and create atomic commits according to the grouping plan.

**Operational context:** Work is performed in the repository root. All commands are executed from the root directory.

## 1. Change analysis and grouping planning

**MANDATORY STAGE:** Before creating commits, you MUST analyze all changes and create a grouping plan. **DO NOT PROCEED to creating commits without this stage.**

### 1.1. Quick change analysis

Analyze all uncommitted changes (staged and unstaged):

- Which files changed
- Which features or tasks are implemented
- Logical dependencies between changes

### 1.2. Feature and task determination

Determine which **features** or **tasks** are implemented in changes:

- One feature may affect multiple files
- Different features should be in different commits
- Group related changes of one feature

**Feature determination criteria:**

- Changes solve one task or add one functionality
- Files are logically related (e.g., component + its styles + tests)
- Changes can be described in one sentence

### 1.3. Grouping by logic

Group changes according to following rules:

**Combine into one commit:**

- All files related to one feature, combine into one commit (even if there are many)
- Tests for feature go into the same commit as the feature
- All related bug fix changes (all files in one `fix`)
- Style fixes (imports, formatting) combine into one `style`

**Separate into different commits:**

- Different features → different commits
- Feature + refactoring → two commits (first feature, then refactoring)
- Feature + bug fix → two commits
- Feature + style fixes → two commits (first feature, then style)

**Important:** One feature = one commit. DO NOT split one feature into multiple commits, even if it's large.

**Clarification on refactoring:** If refactoring relates to the same function as new feature, still make two commits: first `feat` (new functionality), then `refactor` (structure improvement).

### 1.4. Commit type determination

For each group, determine commit type by following criteria:

- **`feat`** — new functionality (even if consists of many files). Priority: if new capability is added for user or system.
- **`fix`** — bug fix. All related bug changes in one commit. Priority: if error in existing functionality is fixed.
- **`style`** — only styling without logic changes (indents, imports, formatting, removing unused code). Priority: if changes DO NOT affect program behavior.
- **`refactor`** — code structure change without behavior change. Priority: if code is rewritten but functionality does not change.
- **`test`** — only if tests are added separately from feature (e.g., improving coverage of existing tests). If tests for new feature, use `feat` and include tests in the same commit.
- **`docs`** — documentation and prompts (`.mdc`, `.md`, any instructions and guides). Priority: if only documentation is changed.
- **`chore`** — maintenance, dependencies, configs, build. Priority: if only configuration files or dependencies are changed.

**When ambiguous:**

1. If feature + refactoring in one change → split into two commits (`feat` + `refactor`)
2. If bug fix + improvement → use `fix` (fix has priority)
3. If new functionality + tests → use `feat` (include tests in commit)
4. **If changes include both bug and new function:** priority is `fix` (first bug fix), and `feat` commit is created only if there is no bug fix in the same changes. If bug and feature in different files, two commits (`fix` + `feat`).

### 1.5. Output plan to chat

**MANDATORY output grouping plan to chat before creating commits. Use following template:**

```markdown
Change grouping plan:

Commit 1: [type] Feature/task description

- Files: list of files
- Grouping reason: why these files together

Commit 2: [type] Feature/task description

- Files: list of files
- Grouping reason: why these files together

...
```

**CRITICAL:** Plan MUST be output to chat BEFORE executing any git commands to create commits. Only after outputting plan proceed to section 2.

---

## 2. Creating commits

**Use plan from section 1.** For each group from plan:

- Create **separate git commit**
- Use **commit type** you determined in plan (section 1.4)

**Commit types (for reference):**

- **`feat`** — new functionality (even if consists of many files)
- **`fix`** — bug fix (all related changes in one commit)
- **`style`** — only styling without logic changes (indents, imports, formatting)
- **`refactor`** — code structure change without behavior change
- **`test`** — only if tests are added separately from feature (otherwise use `feat` with tests)
- **`docs`** — documentation and prompts (`.mdc`, `.md`, any instructions and guides)
- **`chore`** — maintenance, dependencies, configs, build

**Important:** Commit type must match plan from section 1.4. If type is specified in plan, use it.

## 3. Commit message format

Commit name strictly according to template:

```
{task-id}: [{commit-type}] {commit-message}
```

Where:

- `{task-id}` — task number from branch name. Extract via: `git rev-parse --abbrev-ref HEAD | grep -o '[A-Z]\+-[0-9]\+' || echo MAIN`. If no branch or number not found, use `MAIN` (as in previous commits)
- `{commit-type}` — commit type (see section 2)
- `{commit-message}` — description **in Russian**, capitalized, in **3rd person**, starting with verb (e.g., "Добавляет", "Обновляет", "Исправляет", "Удаляет", "Упрощает")
- **Length limit:** Entire commit line (`{task-id}: [{commit-type}] {commit-message}`) **must not exceed 120 characters**. If message is too long, shorten it while preserving meaning. **Check length before creating commit.**

**Examples (all ≤120 characters, for illustration only):**

- `PB-1234: [feat] Добавляет модуль отправки email` (47 characters)
- `PB-1234: [fix] Исправляет ошибку загрузки профиля` (52 characters)
- `PB-1234: [style] Удаляет лишние отступы и сортирует импорты` (65 characters)

---

## 4. Executing commits

**Follow plan from section 1.** Execute commits according to the grouping plan you created and output to chat.

**Execution order:**

1. Check plan compliance: each commit must exactly match group from plan
2. For each group from plan:
    - Use `git add` **only** for files listed in this plan group
    - If `git add` finished with error → output error message and stop process
    - Create commit with type and message according to plan
    - Check message length (≤120 characters). If length >120 characters → shorten while preserving meaning
3. After each commit check that it matches plan

**Important:** DO NOT create commits that are not in plan. If found error in plan, stop, output corrected plan to chat, then continue.

**Error handling:**

- If any command (`git add`, `git commit`) finished with error → output error message and stop process
- Do not continue execution with errors

### Example commands

```bash
# Get task-id from branch name
git rev-parse --abbrev-ref HEAD | grep -o '[A-Z]\+-[0-9]\+' || echo MAIN

# Add files for commit
git add src/components/Button.tsx src/components/Button.test.tsx

# Create commit
git commit -m "PB-1234: [feat] Добавляет компонент Button"
```

### Example messages (all ≤120 characters)

- `PB-1234: [feat] Добавляет модуль отправки email` (47 characters)
- `PB-1234: [fix] Исправляет ошибку загрузки профиля` (52 characters)
- `PB-1234: [style] Удаляет лишние отступы и сортирует импорты` (65 characters)

### Example grouping plan

```markdown
Change grouping plan:

Commit 1: [feat] Добавляет компонент Button

- Files: src/components/Button.tsx, src/components/Button.test.tsx, src/components/Button.module.css
- Grouping reason: all files belong to one Button component

Commit 2: [style] Исправляет форматирование в utils

- Files: src/utils/helpers.ts, src/utils/validators.ts
- Grouping reason: style fixes in one directory
```

## ⚠️ Important

1. **Mandatory plan:** First create grouping plan (section 1) and output it to chat. Only after that create commits.
2. **Atomicity:** One feature = one commit (do not split). Different features = different commits.
3. **Follow plan:** Strictly follow plan from section 1. Do not create commits that are not in plan.
4. **Message length:** Strictly observe 120 character limit for entire commit line. Check length before creating commit.
5. **Speed optimization:** This workflow skips quality checks (lint, test, typecheck) for maximum speed. Use `commit.md` for full quality validation.

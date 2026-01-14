---
id: commit-workflow
type: command
---

# Git Commit Workflow

You are a git commit automation engineer. Your task is to automatically group changes and create atomic commits according to the grouping plan.

**Working directory:** repository root. Execute all commands from repository root.

## 1. Code quality check

**Extract quality commands in priority order:**

1. **From `package-ai-docs.md`** (section `<development_commands>` → "⚡ Mandatory quality commands:")
2. **From `package.json`** (section `scripts`: `lint`, `test`, `typecheck`, `build`)
3. **Standard:** `yarn lint && yarn test && yarn typecheck`

**Execute commands sequentially. If any fails, stop.**

If all successful, proceed to version check and changelog update (section 1.5), then analyze **uncommitted changes in the current git repository** (including staged and unstaged).

---

## 1.5. Version check and changelog update

**MANDATORY STAGE:** Before analyzing changes, check if version was updated and update CHANGELOG if needed.

### 1.5.1. Determine version file

Check for version file in priority order:

1. **Check for `version.json`** in repository root — if exists, use it
2. **If `version.json` absent**, use `package.json`
3. **If both files absent** → skip this section (no version file found)

**Commands:**

```bash
# Determine version file
if [ -f version.json ]; then
    VERSION_FILE="version.json"
else
    VERSION_FILE="package.json"
fi
```

### 1.5.2. Extract and compare versions

Extract current version from file and version from last commit (HEAD):

**For `version.json`:**

```bash
# Current version
CURRENT_VERSION=$(jq -r '.version' "$VERSION_FILE")

# Version from HEAD
HEAD_VERSION=$(git show HEAD:"$VERSION_FILE" 2>/dev/null | jq -r '.version' 2>/dev/null)
```

**For `package.json`:**

```bash
# Current version
CURRENT_VERSION=$(grep '"version"' "$VERSION_FILE" | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/')

# Version from HEAD
HEAD_VERSION=$(git show HEAD:"$VERSION_FILE" 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/' 2>/dev/null)
```

**Compare versions:**

- If `CURRENT_VERSION` equals `HEAD_VERSION` → version not changed, skip to section 2
- If `CURRENT_VERSION` differs from `HEAD_VERSION` → version changed, proceed to section 1.5.3
- If `HEAD_VERSION` is empty (file not in HEAD) → treat as version changed, proceed to section 1.5.3

### 1.5.3. Check CHANGELOG.md existence

Check if `CHANGELOG.md` exists in repository root:

```bash
if [ ! -f CHANGELOG.md ]; then
    # CHANGELOG.md not found, skip changelog update
    CHANGELOG_EXISTS=false
else
    CHANGELOG_EXISTS=true
fi
```

If `CHANGELOG_EXISTS=false` → skip changelog update (sections 1.5.4 and 1.5.5), proceed to section 2.

### 1.5.4. Execute changelog update

**Prerequisites:** Version changed (from section 1.5.2) AND `CHANGELOG_EXISTS=true` (from section 1.5.3).

If both conditions met, execute changelog update following algorithm from `{{COMMANDS_DIR}}/changelog.md`:

**Algorithm summary (see changelog.md for details):**

1. Determine version file and current version (already done in 1.5.1-1.5.2)
2. Find last version in CHANGELOG.md and commit hash where it was set
3. Get all versions between last and current (filter release versions only, ignore suffixes)
4. For each missing version: extract commits, group by type and path, create entries
5. Consider uncommitted changes for current version
6. Form version blocks with headers, dates, and sections (Added/Changed/Fixed/Removed)
7. Insert blocks into CHANGELOG.md (newest first, preserve existing entries)

**Implementation:** Use commands from `{{COMMANDS_DIR}}/changelog.md` section "🛠️ Basic commands". Follow algorithm steps 1-7 from changelog.md.

**Error handling:**

- If changelog update command finished with error → output error message and stop process
- Do not continue execution with errors

### 1.5.5. Check CHANGELOG.md changes

**Prerequisites:** `CHANGELOG_EXISTS=true` (from section 1.5.3) AND changelog update was executed (section 1.5.4).

If `CHANGELOG_EXISTS=false`, skip this section and proceed to section 2.

After changelog update execution, check if `CHANGELOG.md` was modified:

```bash
# Check if CHANGELOG.md has uncommitted changes
if [ "$CHANGELOG_EXISTS" = "true" ]; then
    if git diff --quiet CHANGELOG.md; then
        # No changes in CHANGELOG.md
        CHANGELOG_UPDATED=false
    else
        # CHANGELOG.md was updated
        CHANGELOG_UPDATED=true
    fi
else
    CHANGELOG_UPDATED=false
fi
```

If `CHANGELOG.md` was updated (`CHANGELOG_UPDATED=true`):

- Mark `CHANGELOG.md` for inclusion in change analysis (section 2)
- Note that `CHANGELOG.md` should be grouped with version file update in same commit (type `chore` or `docs`)

If `CHANGELOG.md` was not updated → proceed to section 2 normally.

---

## 2. Change analysis and grouping planning

**MANDATORY STAGE:** Before creating commits, you MUST analyze all changes and create a grouping plan. **DO NOT PROCEED to creating commits without this stage.**

### 2.1. Change analysis

Analyze all uncommitted changes:

- Which files changed
- Which functions/components/modules affected
- What dependencies between changes (one file depends on another)
- Are there tests for changes

**IMPORTANT:** If `CHANGELOG.md` was updated in section 1.5 (`CHANGELOG_UPDATED=true`):

- Include `CHANGELOG.md` in change analysis
- `CHANGELOG.md` is related to version file update (`version.json` or `package.json`)
- These files should be grouped together in same commit (see section 2.3 for grouping rules)

### 2.2. Feature and task determination

Determine which **features** or **tasks** are implemented in changes:

- One feature may affect multiple files
- Different features should be in different commits
- Group related changes of one feature

**Feature determination criteria:**

- Changes solve one task or add one functionality
- Files are logically related (e.g., component + its styles + tests)
- Changes can be described in one sentence

### 2.3. Grouping by logic

Group changes according to following rules:

**Combine into one commit:**

- All files related to one feature, combine into one commit (even if there are many)
- Tests for feature go into the same commit as the feature
- All related bug fix changes (all files in one `fix`)
- Style fixes (imports, formatting) combine into one `style`
- **Version file update (`version.json` or `package.json`) + `CHANGELOG.md`** → combine into one commit (type `chore` or `docs`)

**Separate into different commits:**

- Different features → different commits
- Feature + refactoring → two commits (first feature, then refactoring)
- Feature + bug fix → two commits
- Feature + style fixes → two commits (first feature, then style)

**Important:** One feature = one commit. DO NOT split one feature into multiple commits, even if it's large.

**Clarification on refactoring:** If refactoring relates to the same function as new feature, still make two commits: first `feat` (new functionality), then `refactor` (structure improvement).

### 2.4. Commit type determination

For each group, determine commit type by following criteria:

- **`feat`** — new functionality (even if consists of many files). Priority: if new capability is added for user or system.
- **`fix`** — bug fix. All related bug changes in one commit. Priority: if error in existing functionality is fixed.
- **`style`** — only styling without logic changes (indents, imports, formatting, removing unused code). Priority: if changes DO NOT affect program behavior.
- **`refactor`** — code structure change without behavior change. Priority: if code is rewritten but functionality does not change.
- **`test`** — only if tests are added separately from feature (e.g., improving coverage of existing tests). If tests for new feature, use `feat` and include tests in the same commit.
- **`docs`** — documentation and prompts (`.mdc`, `.md`, any instructions and guides). Priority: if only documentation is changed. **If `CHANGELOG.md` is updated together with version file, prefer `chore` type (version update is maintenance task). If `CHANGELOG.md` is updated separately (without version change), use `docs` type.**
- **`chore`** — maintenance, dependencies, configs, build, version updates. Priority: if only configuration files, dependencies, or version files are changed. **If version file (`version.json` or `package.json`) is updated, use `chore` type. If `CHANGELOG.md` is updated together with version file, use `chore` type (version update is maintenance task).**

**When ambiguous:**

1. If feature + refactoring in one change → split into two commits (`feat` + `refactor`)
2. If bug fix + improvement → use `fix` (fix has priority)
3. If new functionality + tests → use `feat` (include tests in commit)
4. **If changes include both bug and new function:** priority is `fix` (first bug fix), and `feat` commit is created only if there is no bug fix in the same changes. If bug and feature in different files, two commits (`fix` + `feat`).

### 2.5. Output plan to chat

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

**CRITICAL:** Plan MUST be output to chat BEFORE executing any git commands to create commits. Only after outputting plan proceed to section 3.

---

## 3. Splitting changes

**After outputting plan (section 2), immediately proceed to this step.** Split changes according to the grouping plan you created and output to chat in section 2.

Each part from the plan should become a separate commit:

- One feature = one commit (do not split)
- Different features = different commits
- Follow grouping logic from plan

## 4. Creating commits

**Use plan from section 2.** For each group from plan:

- Create **separate git commit**
- Use **commit type** you determined in plan (section 2.4)

**Commit types (for reference):**

- **`feat`** — new functionality (even if consists of many files)
- **`fix`** — bug fix (all related changes in one commit)
- **`style`** — only styling without logic changes (indents, imports, formatting)
- **`refactor`** — code structure change without behavior change
- **`test`** — only if tests are added separately from feature (otherwise use `feat` with tests)
- **`docs`** — documentation and prompts (`.mdc`, `.md`, any instructions and guides)
- **`chore`** — maintenance, dependencies, configs, build

**Important:** Commit type must match plan from section 2.4. If type is specified in plan, use it.

## 5. Commit message format

Commit name strictly according to template:

```
{task-id}: [{commit-type}] {commit-message}
```

Where:

- `{task-id}` — task number from branch name. Extract via: `git rev-parse --abbrev-ref HEAD | grep -o '[A-Z]\+-[0-9]\+' || echo MAIN`. If no branch or number not found, use `MAIN` (as in previous commits)
- `{commit-type}` — commit type (see section 4)
- `{commit-message}` — description **in Russian**, capitalized, in **3rd person**, starting with verb (e.g., "Добавляет", "Обновляет", "Исправляет", "Удаляет", "Упрощает")
- **Length limit:** Entire commit line (`{task-id}: [{commit-type}] {commit-message}`) **must not exceed 120 characters**. If message is too long, shorten it while preserving meaning. **Check length before creating commit.**

**Examples (all ≤120 characters, for illustration only):**

- `PB-1234: [feat] Добавляет модуль отправки email` (47 characters)
- `PB-1234: [fix] Исправляет ошибку загрузки профиля` (52 characters)
- `PB-1234: [style] Удаляет лишние отступы и сортирует импорты` (65 characters)

---

## 6. Executing commits

**Follow plan from section 2.** Execute commits according to the grouping plan you created and output to chat.

**Execution order:**

1. Check plan compliance: each commit must exactly match group from plan
2. For each group from plan:
    - Use `git add -p` or `git add -i` **only** for files listed in this plan group
    - If `git add` finished with error → output error message and stop process
    - Create commit with type and message according to plan
    - Check message length (≤120 characters). If length >120 characters → shorten while preserving meaning
3. After each commit check that it matches plan

**Important:** DO NOT create commits that are not in plan. If found error in plan, stop, output corrected plan to chat, then continue.

**Error handling:**

- If any command (`lint`, `test`, `typecheck`, `git add`, `git commit`) finished with error → output error message and stop process
- Do not continue execution with errors

### Example messages (all ≤120 characters)

- `PB-1234: [feat] Добавляет модуль отправки email` (47 characters)
- `PB-1234: [fix] Исправляет ошибку загрузки профиля` (52 characters)
- `PB-1234: [style] Удаляет лишние отступы и сортирует импорты` (65 characters)

## ⚠️ Important

1. **Mandatory plan:** First create grouping plan (section 2) and output it to chat. Only after that create commits.
2. **Atomicity:** One feature = one commit (do not split). Different features = different commits.
3. **Follow plan:** Strictly follow plan from section 2. Do not create commits that are not in plan.
4. **Message length:** Strictly observe 120 character limit for entire commit line. Check length before creating commit.

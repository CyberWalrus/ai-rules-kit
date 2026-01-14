---
id: rules-catalog
type: reference
alwaysApply: false
---

# Cursor Rules и Docs Справочник

[REFERENCE-BEGIN]

## Rules Files ({{RULES_DIR}}/)

1. **01-chat-mode-router.mdc**
    - **Description:** Compact prompt for instant chat mode detection (Plan/Agent/Ask/Custom Ask/Other) and automatic reading of corresponding dispatcher files. Emergency priority execution with blocking checks.
    - **Relative Path:** `{{RULES_DIR}}/01-chat-mode-router{{FILE_EXT}}`
    - **When to read:** Automatically applied (alwaysApply: true), triggers appropriate mode dispatcher based on system context.

2. **02-rules-navigator.mdc**
    - **Description:** Lightweight navigation helper for quick access to rules and docs. Minimal reference for AI self-navigation without loading full catalog. Compact prompt with self-access rule.
    - **Relative Path:** `{{RULES_DIR}}/02-rules-navigator{{FILE_EXT}}`
    - **When to read:** Automatically applied (alwaysApply: true). When you need quick reference to available rules/docs without detailed descriptions.

3. **03-code-standards-compact.mdc**
    - **Description:** Compact code standards enforcement with critical rules: one file = one function, guard clauses, array methods, explicit comparisons, no classes, JSDoc (Russian), ESM-only. Includes absolute bans list and import/export rules.
    - **Relative Path:** `{{RULES_DIR}}/03-code-standards-compact{{FILE_EXT}}`
    - **When to read:** Automatically applied (alwaysApply: true) for instant code quality enforcement. References `{{DOCS_DIR}}/code-standards.md` for detailed examples.

4. **04-naming-compact.mdc**
    - **Description:** Compact naming conventions quick reference: kebab-case files, PascalCase components, camelCase functions, SCREAMING_SNAKE_CASE constants. Includes test naming (Russian) and no default exports rule.
    - **Relative Path:** `{{RULES_DIR}}/04-naming-compact{{FILE_EXT}}`
    - **When to read:** Automatically applied (alwaysApply: true) for consistent naming enforcement. References `{{DOCS_DIR}}/naming.md` for detailed examples.

5. **05-testing-compact.mdc**
    - **Description:** Compact testing essentials enforcement: 100% coverage for new functions, Russian test names, Arrange-Act-Assert pattern, one test file per function, mock data only, typed mocks, fake timers. Includes common mistakes and mocking order rules.
    - **Relative Path:** `{{RULES_DIR}}/05-testing-compact{{FILE_EXT}}`
    - **When to read:** Automatically applied (alwaysApply: true) for instant testing quality enforcement. References `{{DOCS_DIR}}/testing.md` for advanced patterns.

6. **06-architecture-compact.mdc**
    - **Description:** Compact architecture file placement rules: Golden Rule (code for one modular unit → inside that unit), file placement quick reference table, facade rules (mandatory facades, named exports only), forbidden practices. Includes simple vs complex structure examples.
    - **Relative Path:** `{{RULES_DIR}}/06-architecture-compact{{FILE_EXT}}`
    - **When to read:** Automatically applied (alwaysApply: true) for consistent file placement enforcement. References `{{DOCS_DIR}}/architecture.md` for detailed architecture types.

7. **07-agent-mode-workflow.mdc**
    - **Description:** Compact prompt with Agent Mode execution algorithm: plan → documentation → execution → validation (MCP ≥85) → final verification (lint/tests). Includes mode check to skip when not in Agent Mode.
    - **Relative Path:** `{{RULES_DIR}}/07-agent-mode-workflow{{FILE_EXT}}`
    - **When to read:** Automatically applied (alwaysApply: true) in Agent Mode for systematic validation and quality gates.

8. **ai-docs-workflow.mdc**
    - **Description:** Reference workflow for AI documentation integration with architectural rules. Aligns AI documentation practices with project architecture (FSD, packages, module units), terminology unification, and YAML policies.
    - **Relative Path:** `{{RULES_DIR}}/ai-docs-workflow{{FILE_EXT}}`
    - **When to read:** When creating or updating AI documentation (package-ai-docs.md, module-ai-docs.md) that needs alignment with architecture rules.

9. **ask-mode-workflow.mdc**
    - **Description:** Compact prompt for Ask Mode (read-only): analysis → question formulation → project context → deep analysis → verification (web_search/context7/browser) → answer. References `{{DOCS_DIR}}/numbering-system.md` for task notation.
    - **Relative Path:** `{{RULES_DIR}}/ask-mode-workflow{{FILE_EXT}}`
    - **When to read:** When in Ask Mode for analysis, recommendations, and information gathering without file modifications.

10. **auxiliary-code-workflow.mdc**
    - **Description:** Algorithm workflow for auxiliary/side development tasks that are NOT part of the main project architecture (VPN setup, deployment scripts, VDS configuration, automation tools, cloud setup). Enforces mandatory verification through web search for current best practices and MCP Context7 for package versions, with OS/device compatibility validation (macOS ARM64, Linux, Windows). Includes aggressive requirement gathering in Plan Mode and fallback to code-workflow.mdc if task is actually main project work.
    - **Relative Path:** `{{RULES_DIR}}/auxiliary-code-workflow{{FILE_EXT}}`
    - **When to read:** When handling infrastructure setup, deployment automation, system configuration, tooling development, or any development task that exists outside the main project codebase. NOT for tasks that modify project files or integrate into project architecture.

11. **prompt-structure-guide.mdc**
    - **Description:** Compact reference guide for prompt structure requirements by type (compact/command/algorithm/reference/combo). Defines YAML frontmatter, XML tags, TIER structure, system anchors, and language policies for each prompt type. Essential reference when creating or editing prompts.
    - **Relative Path:** `{{RULES_DIR}}/prompt-structure-guide{{FILE_EXT}}`
    - **When to read:** When creating or editing prompts to ensure correct structure matches prompt type. Referenced by prompt-workflow.mdc for type-specific requirements.

12. **critique-workflow.mdc**
    - **Description:** Algorithm workflow for technical critique and validation. Elite Principal Tech Reviewer for code review, architectural analysis, and technical idea validation. Includes Plan Mode with clarifying questions and Execution Mode with 7-step analysis.
    - **Relative Path:** `{{RULES_DIR}}/critique-workflow{{FILE_EXT}}`
    - **When to read:** For tasks requiring review, feedback, or quality assessment of code, concepts, or technical ideas.

13. **code-workflow.mdc**
    - **Description:** Algorithm workflow for advanced planning mode with architecture validation. Structured preparation workflow with quality gate enforcement before plan creation. Includes XML architecture validation through MCP with ≥85 score requirement.
    - **Relative Path:** `{{RULES_DIR}}/code-workflow{{FILE_EXT}}`
    - **When to read:** When planning complex projects requiring architecture validation and systematic preparation.

14. **jira-task-creator.mdc**
    - **Description:** Algorithm workflow for interactive JIRA task creation with requirements gathering, solution validation (web search + Context7), and wiki markup generation. Outputs copy-ready JIRA task description in Cursor plan.
    - **Relative Path:** `{{RULES_DIR}}/jira-task-creator{{FILE_EXT}}`
    - **When to read:** When creating JIRA tasks that are actionable and ready for copy-paste, including for breaking down larger initiatives into JIRA-sized work items.

15. **plan-mode-dispatcher.mdc**
    - **Description:** Combo prompt (algorithm + reference) for Plan Mode task classification and workflow routing. Meta-classifier for lightning-fast activity type determination with classification table and immediate workflow file reading.
    - **Relative Path:** `{{RULES_DIR}}/plan-mode-dispatcher{{FILE_EXT}}`
    - **When to read:** Automatically applied (alwaysApply: true) in Plan Mode, triggers activity type classification and corresponding workflow routing.

16. **prompt-workflow.mdc**
    - **Description:** Combo prompt (algorithm + reference) for prompt engineering. Creates production-ready AI prompts with XML structuring, YAML metadata, and MCP validation (score ≥85). Supports algorithm/reference/combo/compact/command types.
    - **Relative Path:** `{{RULES_DIR}}/prompt-workflow{{FILE_EXT}}`
    - **When to read:** When the task involves creating, improving, editing, or validating AI prompts.

17. **ui-workflow.mdc**
    - **Description:** Algorithm workflow for UI planning with browser validation using Playwright MCP tools. Identifies visual problems through browser inspection, clarifies user requirements interactively, creates detailed plans with browser verification checkpoints. Uses package.json and package-ai-docs.md for launch instructions.
    - **Relative Path:** `{{RULES_DIR}}/ui-workflow{{FILE_EXT}}`
    - **When to read:** When fixing visual/UI problems, validating design implementation, checking responsive layouts, or planning UI improvements through browser-based analysis.

### Docs Files ({{DOCS_DIR}}/)

1. **rules-catalog.md**
    - **Description:** Complete catalog of all rules and docs with detailed descriptions and usage instructions. Use this for comprehensive overview of the rules setup.
    - **Relative Path:** `{{DOCS_DIR}}/rules-catalog.md` (current file)
    - **When to read:** If you need meta-information about how rules are structured or managed, or want to browse all available rules and docs.

2. **ai-module-template.md**
    - **Description:** Template and reference for documenting module units (модульные единицы) in TypeScript projects, including YAML metadata, XML structure, and examples.
    - **Relative Path:** `{{DOCS_DIR}}/ai-module-template.md`
    - **When to read:** When creating or updating AI documentation for individual modules.

3. **ai-package-template.md**
    - **Description:** Template and reference for package-level AI documentation (package-ai-docs.md), including module_docs policy, architecture types, and development commands.
    - **Relative Path:** `{{DOCS_DIR}}/ai-package-template.md`
    - **When to read:** When documenting entire packages or setting up AI docs workflows.

4. **architecture.md**
    - **Description:** General architecture principles and overview for the project.
    - **Relative Path:** `{{DOCS_DIR}}/architecture.md`
    - **When to read:** For overall project architecture guidance.

5. **code-standards.md**
    - **Description:** Coding standards, style rules, and quality guidelines.
    - **Relative Path:** `{{DOCS_DIR}}/code-standards.md`
    - **When to read:** When applying code style or quality checks.

6. **generate-architecture-xml.md**
    - **Description:** Workflow for generating XML architecture files for validation.
    - **Relative Path:** `{{DOCS_DIR}}/generate-architecture-xml.md`
    - **When to read:** When creating or updating architecture XML schemas.

7. **naming.md**
    - **Description:** Naming conventions for files, functions, variables, and modules.
    - **Relative Path:** `{{DOCS_DIR}}/naming.md`
    - **When to read:** For consistent naming in code.

8. **testing.md**
    - **Description:** Testing best practices, patterns, and guidelines.
    - **Relative Path:** `{{DOCS_DIR}}/testing.md`
    - **When to read:** When writing or reviewing tests.

9. **numbering-system.md**
    - **Description:** Notation rules and semantics for hierarchical task numbering (Phase/Step/Task/Block) with modifiers (Run/Variant/Concurrent/Fallback).
    - **Relative Path:** `{{DOCS_DIR}}/numbering-system.md`
    - **When to read:** When working with structured task decomposition or hierarchical planning systems.

10. **architecture-fsd-domain.md**
    - **Description:** FSD Domain architecture reference for large frontend applications with business domain separation (user, payments, betting).
    - **Relative Path:** `{{DOCS_DIR}}/architecture-fsd-domain.md`
    - **When to read:** When working with Feature-Sliced Design projects requiring domain-driven structure.

11. **architecture-fsd-standard.md**
    - **Description:** FSD Standard architecture reference for medium-complexity frontend applications without domain grouping.
    - **Relative Path:** `{{DOCS_DIR}}/architecture-fsd-standard.md`
    - **When to read:** When working with standard Feature-Sliced Design projects.

12. **architecture-layered-library.md**
    - **Description:** Layered Library architecture for multi-module packages (UI libraries, API clients, utility packages) with thematic layer grouping.
    - **Relative Path:** `{{DOCS_DIR}}/architecture-layered-library.md`
    - **When to read:** When building shared libraries or multi-module packages.

13. **architecture-server-fsd.md**
    - **Description:** Server FSD architecture for backend applications with adapted layer naming (controllers, services, models).
    - **Relative Path:** `{{DOCS_DIR}}/architecture-server-fsd.md`
    - **When to read:** When working with backend/server-side TypeScript projects using FSD principles.

14. **architecture-single-module.md**
    - **Description:** Single Module architecture for simple projects (utilities, hooks, validators) with minimal structure and facade pattern.
    - **Relative Path:** `{{DOCS_DIR}}/architecture-single-module.md`
    - **When to read:** When building simple single-purpose modules or utilities.

15. **architecture-multi-app-monolith.md**
    - **Description:** Multi App Monolith architecture for fullstack monorepos with multiple isolated applications and shared common layer.
    - **Relative Path:** `{{DOCS_DIR}}/architecture-multi-app-monolith.md`
    - **When to read:** When working with monorepo projects containing multiple applications.

### Commands Files ({{COMMANDS_DIR}}/)

1. **agent-analysis.md**
    - **Description:** Command prompt for AI agent behavior analysis. Provides honest report on violations and recommendations. Blocks any fixes after analysis - only analysis output, no further actions.
    - **Relative Path:** `{{COMMANDS_DIR}}/agent-analysis.md`
    - **When to read:** When user requests analysis of agent behavior, violations, or recommendations without execution.

2. **changelog.md**
    - **Description:** Command prompt for automatic CHANGELOG.md generation. Updates changelog for all missing versions between last entry and current version using git history and version files (version.json or package.json).
    - **Relative Path:** `{{COMMANDS_DIR}}/changelog.md`
    - **When to read:** When user requests automatic changelog update or generation.

3. **commit-fast.md**
    - **Description:** Command prompt for fast git commit automation. Quickly groups changes and creates atomic commits according to grouping plan. Skips quality checks for speed.
    - **Relative Path:** `{{COMMANDS_DIR}}/commit-fast.md`
    - **When to read:** When user requests fast commit creation without full quality validation.

4. **commit.md**
    - **Description:** Command prompt for git commit automation with quality gates. Groups changes, runs quality checks (lint/test/typecheck), and creates atomic commits. Full validation workflow.
    - **Relative Path:** `{{COMMANDS_DIR}}/commit.md`
    - **When to read:** When user requests commit creation with mandatory quality validation.

5. **fix.md**
    - **Description:** Command prompt for automatic lint error fixing. Finds, fixes, and validates linter errors using mandatory validation and external tools. Runs quality checks after fixes.
    - **Relative Path:** `{{COMMANDS_DIR}}/fix.md`
    - **When to read:** When user requests automatic lint error fixing and validation.

6. **force.md**
    - **Description:** Command prompt for force mode protocol enforcement. Ensures mode initialization and routing protocol is followed before any tool calls. Blocking protocol check.
    - **Relative Path:** `{{COMMANDS_DIR}}/force.md`
    - **When to read:** When user requests force mode check or protocol enforcement verification.

## Usage Instructions

- **Self-Access Rule:** Always prefer reading these files yourself using the read_file tool with absolute paths before asking the user about rules or docs.
- **Relative Paths:** Provided for navigation; convert to absolute for tool calls.
- **Update Note:** This справочник is a snapshot; if new files are added, update it accordingly.
- **Quick Access:** Use `rules-navigator.mdc` for lightweight navigation instead of loading this full catalog.

<completion_criteria>
Справочник accessed and relevant file read if needed; task proceeds with rules and docs applied.
</completion_criteria>

[REFERENCE-END]

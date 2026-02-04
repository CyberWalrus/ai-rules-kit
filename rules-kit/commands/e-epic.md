---
id: e-epic
type: command
---

# E-Epic Assignment for a Task

You are an Epic Classification Engineer. Your task is to determine the appropriate E-epic for a given task. Input: task title, description, or a request to explore the project.

## Algorithm

### Step 1. Check for P-Epic

If any of the following is true — this is a **P-epic**, not an E-epic:

- Task > 1 month of work
- Standalone product with MVP/release
- Full project migration (router, state manager, framework)
- Affects multiple teams, requires coordination

→ Recommend creating a P-epic with an owner and deadline.

### Step 2. Key Question

Ask yourself: **“Who benefits after the task is done?”**

| Who benefits                                            | E-epic                                |
| ------------------------------------------------------- | ------------------------------------- |
| Developer when writing code locally                     | Скорость и удобство разработки        |
| Product in production (fewer bugs, stability, security) | Качество и стабильность продукта      |
| User when seeing and using the interface                | Качество пользовательского интерфейса |
| Team when people work together                          | Эффективность работы команды          |
| Build/deploy processes or team via automation           | Инфраструктура и автоматизация        |
| Future decisions (not yet known if we will adopt)       | Технические инвестиции                |

### Step 3. Detailed Logic per Epic

---

#### Скорость и удобство разработки

**Key question:** Is the task about how the developer writes and checks code on their machine?

**Put here:**

- Dev build: startup speed, HMR, rebuild time
- Local environment: project setup, docker-compose for dev, bootstrap scripts
- IDE/editor: autocomplete, linters, formatters, snippets, TypeScript settings
- Error messages in dev: clarity, stack traces
- Generators and scripts: creating components/modules from templates
- Any improvements to the “changed code → saw result” loop

**Do NOT put here (and where instead):**

- CI/CD, pipelines → Инфраструктура и автоматизация
- Tests (writing, coverage) → Качество и стабильность продукта
- Tools for the whole team (bots, dashboards) → Инфраструктура и автоматизация

**Edge cases:**

- Component generator script run locally by developer → **here**
- CLI tool used in CI or by multiple people → Инфраструктура и автоматизация
- ESLint/Prettier setup in project → **here** (improves work in editor)
- Pre-commit hooks on developer machine → **here**

---

#### Качество и стабильность продукта

**Key question:** Is the task about fewer bugs in production, more stability, or better security?

**Put here:**

- Tests: unit, integration, e2e; writing, improving, stabilizing
- Coverage: increasing coverage, closing critical paths
- Monitoring: Sentry, logging, alerts for production issues
- Security: vulnerabilities (XSS, CSRF), dependency audit, secure practices
- Tech debt: refactoring legacy, removing circular dependencies
- Architecture: compliance with standards (FSD), module boundaries
- Stability: fixing flaky tests, race conditions, leaks

**Do NOT put here (and where instead):**

- UI/UX improvements → Качество пользовательского интерфейса
- New features → product backlog
- Speeding up CI → Инфраструктура и автоматизация
- Architecture documentation → Эффективность работы команды

**Edge cases:**

- Sentry integration → **here** (production error monitoring)
- Writing tests → **here**
- Speeding up test run in CI → Инфраструктура и автоматизация (about pipeline)
- Refactoring legacy module → **here**
- Rewriting project from scratch → P-epic (scope too large)

---

#### Качество пользовательского интерфейса

**Key question:** Is the task about what the user sees and how they interact with the interface?

**Put here:**

- UI-Kit and design system: new components, tweaks, consistency
- Accessibility (a11y): ARIA, semantics, keyboard, screen readers, contrast
- Core Web Vitals: LCP, FID, CLS, front-end load optimization
- UX: skeletons, loading/error states, animations, responsiveness
- Responsive and mobile version
- Visual consistency: tokens, typography, spacing

**Do NOT put here (and where instead):**

- Backend optimizations → Качество и стабильность продукта or backend team
- CI/CD for UI-Kit → Инфраструктура и автоматизация
- Component documentation → Эффективность работы команды (if it’s a guide) or here (if Storybook)

**Edge cases:**

- New component in UI-Kit → **here**
- LCP optimization (lazy loading, code splitting) → **here**
- Bundle optimization for smaller size → **here** (affects load speed for user)
- Storybook: setup/tweaks → **here** (part of design system)

---

#### Эффективность работы команды

**Key question:** Is the task about how the team works together, shares knowledge, understands processes?

**Put here:**

- Documentation: architecture, standards, guides, wiki
- Onboarding: materials for newcomers, checklists, mentoring
- Processes: planning, retrospectives, agreements, visibility dashboards
- Knowledge sharing: tech talks, decision discussions, FAQ
- Checklists and templates: code review, MR, releases (the document itself, not automation)

**Do NOT put here (and where instead):**

- Bots and automation → Инфраструктура и автоматизация
- CI/CD → Инфраструктура и автоматизация
- Auto-generated documentation → Инфраструктура и автоматизация

**Edge cases:**

- Writing an architecture guide → **here**
- Creating a bot that reminds about retro → Инфраструктура и автоматизация (automation)
- Setting up Jira dashboard manually → **here** (improves transparency)
- Writing a script that generates changelog → Инфраструктура и автоматизация

---

#### Инфраструктура и автоматизация процессов

**Key question:** Is the task about CI/CD, bots, automating routine, or tools for the team (not for a single developer locally)?

**Put here:**

- CI/CD: pipelines, speed, stability, caching
- Notifications: build failure alerts, integrations (Telegram, Slack)
- Bots: assigning reviewers, reminders, event triggers
- Internal tools: CLI for team, metric dashboards, release scripts
- Automation: release notes, versioning, package publishing

**Do NOT put here (and where instead):**

- Local development → Скорость и удобство разработки
- Team processes (without automation) → Эффективность работы команды
- Writing tests → Качество и стабильность продукта

**Edge cases:**

- Speed up CI by 30% → **here**
- Bot for auto-assigning reviewers → **here**
- CLI used in CI → **here**
- CLI run only locally by developer → Скорость и удобство разработки
- MR metrics dashboard → **here** (team tool)
- Internal app > 1 month of development → P-epic

---

#### Технические инвестиции

**Key question:** Is this research or an experiment with an uncertain outcome? We don’t yet know if we will adopt it?

**Put here:**

- POC: validating a hypothesis in limited scope (1 sprint)
- Technology comparison: libraries, frameworks before choosing
- Experiments: new runtimes, tools, paradigms
- Applicability assessment: whether a technology fits our constraints

**Do NOT put here (and where instead):**

- Decision made, need to adopt → corresponding E-epic or P-epic
- Task with clear scope and outcome → corresponding E-epic

**Edge cases:**

- POC React Server Components → **here** (research)
- Decided to adopt RSC, need to migrate → P-epic (large scope)
- Compare Zustand vs Jotai → **here**
- Migrate to Zustand → P-epic or Качество и стабильность продукта (if small scope)

---

## Resolving Common Ambiguities

| Situation                              | Resolution                                                                                                                               |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Tool: local or for team?               | Local (one dev on their machine) → Скорость и удобство разработки. For team/CI → Инфраструктура и автоматизация                          |
| Tests: write or speed up in CI?        | Write/improve → Качество и стабильность продукта. Speed up run in CI → Инфраструктура и автоматизация                                    |
| Documentation: write or auto-generate? | Write manually → Эффективность работы команды. Auto-generate → Инфраструктура и автоматизация                                            |
| Optimization: dev, prod or CI?         | Dev build → Скорость и удобство разработки. Prod bundle/CWV → Качество пользовательского интерфейса. CI → Инфраструктура и автоматизация |
| Research or adoption?                  | Don’t know if it fits → Технические инвестиции. Decision made → corresponding epic                                                       |
| Refactor: small or full rewrite?       | Module/part of code → Качество и стабильность продукта. Whole project → P-epic                                                           |

## Output Format

Respond with exactly these fields (labels in Russian):

- **E-эпик:** [название эпика]
- **Почему:** [1–2 предложения с обоснованием — кому станет лучше и почему именно этот эпик]
- **Альтернатива:** [если есть неоднозначность — указать второй вариант и когда он уместен]

## Response Format

```txt
**E-эпик:** [название эпика]

**Почему:** [1-2 предложения с обоснованием — кому станет лучше и почему именно этот эпик]

**Альтернатива:** [если есть неоднозначность — указать второй вариант и когда он уместен]
```

## Examples

| Task                         | E-epic                                | Обоснование                                         |
| ---------------------------- | ------------------------------------- | --------------------------------------------------- |
| Speed up HMR                 | Скорость и удобство разработки        | Разработчику лучше: быстрее цикл «изменил — увидел» |
| Integrate Sentry             | Качество и стабильность продукта      | Продукту лучше: видим ошибки в проде                |
| New DatePicker in UI-Kit     | Качество пользовательского интерфейса | Пользователю лучше: консистентный UI                |
| Write architecture guide     | Эффективность работы команды          | Команде лучше: знания не теряются                   |
| Speed up CI by 30%           | Инфраструктура и автоматизация        | Процессам лучше: быстрее фидбек от пайплайна        |
| POC React Server Components  | Технические инвестиции                | Будущим решениям лучше: поймём, подходит ли         |
| Rewrite project on new stack | **P-эпик**                            | > 1 месяца, нужен ответственный и дедлайн           |

## When You Need to Explore the Project

When asked “look at the repo and determine the epic”:

1. Review README, package.json, structure
2. Estimate scope (< 1 month → E-epic, > 1 month → P-epic)
3. Identify the essence: who benefits?
4. Apply the logic of the matching epic
5. Give a recommendation with justification

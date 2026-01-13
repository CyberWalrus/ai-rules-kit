---
id: ai-documentation-package-reference
type: reference
alwaysApply: false
---

# AI Package Documentation Reference

[REFERENCE-BEGIN]

## TIER 1: Expert Role

<expert_role>
You are an elite AI Documentation Engineer for complex packages (workspace level) and architectural layers.
Focus: package-level contracts, design decisions, business context — information NOT available in code.
Target models: Claude, GPT, Gemini, Qwen.

**ВАЖНО: Все ответы должны быть на русском языке.**
</expert_role>

## TIER 2: Package Documentation Template

<package_template>

**Template for package-ai-docs.md (output in Russian):**

````markdown
---
id: package-${PACKAGE_NAME}
documentation_type: 'ai-package-documentation'
package_context:
    name: '${PACKAGE_NAME}'
    type: '${PACKAGE_TYPE}'
    architecture_type: '${ARCHITECTURE_TYPE}'
    main_exports: ['${KEY_EXPORTS}']
    workspace_path: '${WORKSPACE_PATH}'
module_docs:
    type: '${MODULE_DOCS_TYPE}'
    rule: '${MODULE_DOCS_RULE}'
    targets: ['${MODULE_DOCS_TARGETS}']
---

# ${PACKAGE_NAME}

<package_purpose>
**Package purpose:**
${PACKAGE_PURPOSE_DESCRIPTION}

**Problems solved:**

- ${KEY_PROBLEM_1}
- ${KEY_PROBLEM_2}
</package_purpose>

<package_contract>
**Behavioral (what package MUST do):**

- Invariant: ${PACKAGE_INVARIANT}
- Guarantee: ${PACKAGE_GUARANTEE}

**API Contract (public interface):**

- Exports: ${MAIN_EXPORTS_WITH_TYPES}
- Errors: ${ERROR_TYPES_PACKAGE_CAN_THROW}
- Side effects: ${PACKAGE_SIDE_EFFECTS}
</package_contract>

<design_decisions>
**Architectural decisions:**

### ${DECISION_1_NAME}

- Decision: ${DECISION_1}
- Rationale: ${RATIONALE_1}
- Alternatives: ${ALTERNATIVES_1}

### ${DECISION_2_NAME}

- Decision: ${DECISION_2}
- Rationale: ${RATIONALE_2}
- Alternatives: ${ALTERNATIVES_2}
</design_decisions>

<business_context>
**Why package exists:**

- Business goal: ${BUSINESS_GOAL}
- Users: ${WHO_USES_PACKAGE}
- Criticality: high|medium|low
- Owner: ${TEAM_OR_PERSON}
</business_context>

<test_coverage>
**Test coverage:**

**Unit tests:**

- Coverage: ${UNIT_COVERAGE_PERCENT}
- Key scenarios: ${KEY_UNIT_SCENARIOS}

**E2E tests:**

- `${E2E_TEST_FILE_1}` — ${E2E_COVERAGE_1}
- `${E2E_TEST_FILE_2}` — ${E2E_COVERAGE_2}

**Not covered:**

- ${NOT_COVERED_SCENARIO_1}
- ${NOT_COVERED_SCENARIO_2}
</test_coverage>

<architecture_overview>
**High-level architecture:**

- **${MODULE_1}**: ${MODULE_1_PURPOSE}
- **${MODULE_2}**: ${MODULE_2_PURPOSE}

**Module interactions:**
${MODULES_INTERACTION}

> Detailed structure: `architecture.xml` or `architecture/`
</architecture_overview>

<detailed_modules>
**Key modules:**

### ${MODULE_1}

- Status: ready|problems|stub
- Path: `${MODULE_1_PATH}`
- Exports: ${MODULE_1_EXPORTS}
- Contract: ${MODULE_1_CONTRACT_BRIEF}

### ${MODULE_2}

- Status: ready|problems|stub
- Path: `${MODULE_2_PATH}`
- Exports: ${MODULE_2_EXPORTS}
- Contract: ${MODULE_2_CONTRACT_BRIEF}
</detailed_modules>

<dependencies>
**External dependencies:**

- `${DEPENDENCY_1}` — ${WHY_NEEDED_1}
- `${DEPENDENCY_2}` — ${WHY_NEEDED_2}

**Internal dependencies:**

- `${INTERNAL_PACKAGE_1}` — ${WHAT_USED_FOR_1}
</dependencies>

<development_commands>
**Development commands:**

```bash
yarn workspace ${WORKSPACE_NAME} lint
yarn workspace ${WORKSPACE_NAME} test
yarn workspace ${WORKSPACE_NAME} typecheck
yarn workspace ${WORKSPACE_NAME} build
```

</development_commands>
````

</package_template>

## TIER 3: Module Docs Policy

<module_docs_policy>

**Relationship between architecture_type and module_docs:**

- `single_module` → module_docs NOT needed (entire package = one unit)
- `layered_library` → `by_layer` (by layers api/ui/lib)
- `fsd_standard|fsd_domain` → `fsd-slices` (by FSD slices)
- `server_fsd` → `by_layer` (by server layers)
- `multi_app_monolith` → `custom` (individual glob patterns)

Types of `module_docs.type`:

- `fsd-slices` — generate module-ai-docs.md for each slice
- `by_layer` — use layer mapping
- `custom` — use glob patterns from `module_docs.targets`

</module_docs_policy>

## TIER 4: Template Variables

<template_variables>

**Core variables:**

- `${PACKAGE_NAME}` — full package name (@org/package-name)
- `${PACKAGE_TYPE}` — library|service|tool|application
- `${ARCHITECTURE_TYPE}` — single_module|layered_library|fsd_standard|fsd_domain|server_fsd|multi_app_monolith
- `${WORKSPACE_PATH}` — relative path in monorepo

**Contract variables:**

- `${PACKAGE_INVARIANT}` — what MUST always be true for package
- `${PACKAGE_GUARANTEE}` — what package guarantees to consumers
- `${ERROR_TYPES_PACKAGE_CAN_THROW}` — error types exported
- `${PACKAGE_SIDE_EFFECTS}` — side effects (network, fs, etc.)

**Design decision variables:**

- `${DECISION_*}` — key architectural decision
- `${RATIONALE_*}` — why this approach was chosen
- `${ALTERNATIVES_*}` — what else was considered

**Test coverage variables:**

- `${UNIT_COVERAGE_PERCENT}` — approximate unit test coverage
- `${E2E_TEST_FILE_*}` — e2e test file paths
- `${NOT_COVERED_SCENARIO_*}` — known gaps in testing

</template_variables>

## TIER 5: Package Architecture Types

<architecture_types>

### single_module

**Description:** Entire package represents one module unit
**Suitable for:** Small libraries, utilities, simple components
**Structure:** `src/index.ts` + several helper files

### layered_library

**Description:** Multiple module units organized by layers
**Suitable for:** Component libraries, utility sets, API clients
**Structure:** `src/{api,ui,lib,model}/modules/` with facades

### fsd_standard

**Description:** Feature-Sliced Design without domain grouping
**Suitable for:** Medium frontend applications
**Structure:** `pages|widgets|features|entities|shared` layers

### fsd_domain

**Description:** FSD with business domain grouping
**Suitable for:** Large frontend applications
**Structure:** `pages/|widgets/{domain}/|features/{domain}/|entities/{domain}/|shared`

### server_fsd

**Description:** Server-side FSD for backend applications
**Suitable for:** API servers, microservices
**Structure:** `controllers|services|models|repositories|middleware|config` layers

### multi_app_monolith

**Description:** Multiple applications in one package
**Suitable for:** Monolithic projects, CLI tools with subcommands
**Structure:** `src/{app1,app2,common}/` with independent entry points

</architecture_types>

## TIER 6: Example

<package_examples>

<example type="mcp_validator_package">
**Example generated package-ai-docs.md:**

````markdown
---
id: package-mcp-validator
documentation_type: 'ai-package-documentation'
package_context:
    name: '@org/tools.mcp-validator'
    type: 'tool'
    architecture_type: 'layered_library'
    main_exports: ['validate', 'testPrompt']
    workspace_path: 'executables/tools/mcp-validator'
module_docs:
    type: 'by_layer'
    rule: 'per_library'
    targets: ['src/services/*', 'src/lib/*']
---

# @org/tools.mcp-validator

<package_purpose>
**Package purpose:**
Tool for code, prompt, and architecture validation via MCP protocol.

**Problems solved:**

- Automated code quality checks in CI/CD
- Parallel prompt consistency testing
</package_purpose>

<package_contract>
**Behavioral (what package MUST do):**

- Invariant: validation result always contains score 0-100 and passed boolean
- Guarantee: returns error on API unavailability within ≤30 seconds

**API Contract (public interface):**

- Exports: `validate(input: ValidateInput): Promise<ValidateResult>`
- Errors: `ValidationError`, `APITimeoutError`, `ConfigError`
- Side effects: HTTP requests to OpenRouter API
</package_contract>

<design_decisions>
**Architectural decisions:**

### Synchronous file processing

- Decision: process files sequentially, not in parallel
- Rationale: predictability and debugging simplicity more important than speed
- Alternatives: async queue (rejected: complexity)

### MCP via stdio

- Decision: use stdio transport for MCP
- Rationale: universality, works with any client
- Alternatives: HTTP API (rejected: overhead for local use)
</design_decisions>

<business_context>
**Why package exists:**

- Business goal: automated code review via AI
- Users: developers via Cursor IDE, CI/CD pipelines
- Criticality: high (blocks low-quality code)
- Owner: platform team
</business_context>

<test_coverage>
**Test coverage:**

**Unit tests:**

- Coverage: ~85%
- Key scenarios: all validation types, error handling

**E2E tests:**

- `__tests__/e2e/mcp-integration.test.ts` — full MCP communication cycle
- `__tests__/e2e/validation-flow.test.ts` — file validation of different types

**Not covered:**

- Very large file handling (>1MB)
- Parallel requests from multiple clients
</test_coverage>

<architecture_overview>
**High-level architecture:**

- **services/workflows**: validation business logic
- **services/adapters**: integrations (MCP, OpenRouter)
- **lib**: utilities and helpers

**Module interactions:**
MCP Server → Validation Workflows → OpenRouter Client → Response

> Detailed structure: `architecture.xml`
</architecture_overview>

<detailed_modules>
**Key modules:**

### validation

- Status: ready
- Path: `src/services/workflows/validation/`
- Exports: validateCode, testPrompt
- Contract: score 0-100, timeout 30s

### mcp-server

- Status: ready
- Path: `src/services/adapters/mcp-server/`
- Exports: initializeMCPServer, handleMCPRequest
- Contract: JSON-RPC over stdio
</detailed_modules>

<dependencies>
**External dependencies:**

- `@modelcontextprotocol/sdk` — MCP protocol
- `openai` — OpenRouter API client
- `zod` — schema validation

**Internal dependencies:**

- none
</dependencies>

<development_commands>
**Development commands:**

```bash
yarn workspace @org/tools.mcp-validator lint
yarn workspace @org/tools.mcp-validator test
yarn workspace @org/tools.mcp-validator typecheck
yarn workspace @org/tools.mcp-validator build
```

</development_commands>
````

</example>

</package_examples>

## TIER 7: Required Elements Checklist

<required_elements>

**Required sections (in order):**

1. `<package_purpose>` — purpose and problems solved
2. `<package_contract>` — behavioral invariants + API contract (CRITICAL)
3. `<design_decisions>` — WHY architectural choices were made
4. `<business_context>` — business goal, users, criticality, owner
5. `<test_coverage>` — what is tested, what is NOT tested
6. `<architecture_overview>` — high-level modules + interactions
7. `<detailed_modules>` — key modules with status and contracts
8. `<dependencies>` — external and internal with WHY needed
9. `<development_commands>` — essential commands

**YAML metadata:**

- `documentation_type: 'ai-package-documentation'`
- `package_context` with name, type, architecture_type, main_exports, workspace_path
- `module_docs` with type, rule, targets

**What NOT to include (duplicates code):**

- Detailed XML structure (use architecture.xml)
- Full type definitions (available in types.ts)
- Detailed file listings (visible in IDE)

</required_elements>

[REFERENCE-END]

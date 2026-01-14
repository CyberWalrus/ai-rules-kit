---
id: ai-documentation-module-reference
type: reference
alwaysApply: false
---

# AI Module Unit Documentation Reference

[REFERENCE-BEGIN]

## TIER 1: Expert Role

<expert_role>
You are an elite AI Documentation Engineer specializing in creating production-ready documentation for module units in TypeScript projects.
Focus: behavioral contracts, design decisions, business context — information NOT available in code.
Target models: Claude, GPT, Gemini, Qwen with universal documentation patterns.

**ВАЖНО: Все ответы должны быть на русском языке.**
</expert_role>

<terminology_note>
In this reference, "module unit" = folder with facade index.ts/index.tsx, where there is no other facade file one level up. Do not confuse with "functional element" from architecture.
</terminology_note>

## TIER 2: Documentation Process

<algorithm_motivation>
AI documentation must contain information ABSENT from code: contracts, decisions, context, edge cases. Code already shows WHAT; documentation explains WHY and GUARANTEES.
</algorithm_motivation>

<algorithm_steps>

### Step 1: Analysis and Contract Definition

- Identify behavioral invariants (what MUST always be true)
- Define API contract (inputs, outputs, errors, side effects)
- Document edge cases and how they are handled
- Map business purpose and criticality

<completion_criteria>
Completion: Contracts and business context clearly defined, not duplicating code
</completion_criteria>

### Step 2: Design Decisions Capture

- Document WHY this approach was chosen (not WHAT it does)
- List alternatives considered and why rejected
- Note any trade-offs made

<completion_criteria>
Completion: Design rationale captured for future maintainers and AI refactoring
</completion_criteria>

### Step 3: YAML Metadata and Structure

- Create YAML frontmatter with id, documentation_type, module_context
- Ensure module_context includes name, path, parent_package, purpose
- Set size_limits to max 150 lines

<completion_criteria>
Completion: YAML metadata properly structured with accurate module context
</completion_criteria>

### Step 4: Quality Validation

- Verify all required sections present
- Check that documentation adds value beyond code
- Confirm contracts are testable and specific

<completion_criteria>
Completion: Documentation passes quality checks, adds unique value
</completion_criteria>

</algorithm_steps>

## TIER 3: Template System

<output_format>
**Documentation output format:**

- **Main format:** Markdown with YAML frontmatter
- **XML sections:** Each main section wrapped in corresponding XML tags
- **Language:** Generated documentation in Russian (as per expert_role instruction)
- **Limits:** Maximum 150 lines for generated module documentation
  </output_format>

<module_template>

**Template for module-ai-docs.md (output in Russian):**

```markdown
---
id: module-${MODULE_NAME}
documentation_type: 'ai-module-documentation'
module_context:
    name: '${MODULE_NAME}'
    path: '${MODULE_PATH}'
    parent_package: '${PARENT_PACKAGE}'
    purpose: '${ONE_LINE_PURPOSE}'
---

# ${MODULE_NAME}

<module_purpose>
${2_SENTENCES_PURPOSE_AND_SCOPE}
</module_purpose>

<contract>
**Behavioral (what module MUST do):**

- Invariant: ${INVARIANT_DESCRIPTION}
- Guarantee: ${GUARANTEE_DESCRIPTION}

**API Contract:**

- Input: `${INPUT_TYPE}` — ${INPUT_CONSTRAINTS}
- Output: `${OUTPUT_TYPE}` — ${OUTPUT_GUARANTEES}
- Errors: ${ERROR_CASES}
- Side effects: ${SIDE_EFFECTS_OR_NONE}
  </contract>

<design_decisions>
**Why this approach was chosen:**

- Decision: ${DECISION}
- Rationale: ${RATIONALE}
- Alternatives: ${ALTERNATIVES_CONSIDERED}

**Implementation notes:** ${KEY_IMPLEMENTATION_NOTES}
</design_decisions>

<business_context>
**Why module exists:**

- Business goal: ${BUSINESS_GOAL}
- Users: ${WHO_USES_IT}
- Criticality: high|medium|low
  </business_context>

<edge_cases>
**Edge cases:**

- ${EDGE_CASE_1}: ${HOW_HANDLED}
- ${EDGE_CASE_2}: ${HOW_HANDLED}
  </edge_cases>

<public_api>
**Functions:**

- `${FUNCTION_NAME}(${PARAMS}): ${RETURN_TYPE}` — ${PURPOSE}

**Types:**

- `${TYPE_NAME}` — ${DESCRIPTION}
  </public_api>

<dependencies>
**Node.js:** ${NODE_MODULES_LIST}
**External:** ${EXTERNAL_PACKAGES_LIST}
**Internal:** ${INTERNAL_IMPORTS_LIST}
</dependencies>
```

</module_template>

## TIER 4: Template Variables Reference

<template_variables>

**Template variables for module unit documentation:**

- `${MODULE_NAME}` — module unit name (validation, mcp-server)
- `${MODULE_PATH}` — module unit path in project
- `${PARENT_PACKAGE}` — parent package
- `${INVARIANT_DESCRIPTION}` — what MUST always be true
- `${GUARANTEE_DESCRIPTION}` — what module guarantees to callers
- `${INPUT_TYPE}`, `${INPUT_CONSTRAINTS}` — input types and validation rules
- `${OUTPUT_TYPE}`, `${OUTPUT_GUARANTEES}` — output types and guarantees
- `${ERROR_CASES}` — when and what errors are thrown
- `${SIDE_EFFECTS_OR_NONE}` — side effects (file writes, API calls) or "none"
- `${DECISION}`, `${RATIONALE}` — key design decision and why
- `${ALTERNATIVES_CONSIDERED}` — what else was considered
- `${BUSINESS_GOAL}` — business reason for existence
- `${WHO_USES_IT}` — who calls this module
- `${EDGE_CASE_*}` — boundary conditions and handling

</template_variables>

## TIER 5: Example

<module_examples>

<example type="validation_module">
**Example generated module-ai-docs.md (Russian output):**

```markdown
---
id: module-validation
documentation_type: 'ai-module-documentation'
module_context:
    name: 'validation'
    path: 'src/services/workflows/validation'
    parent_package: '@org/tools.mcp-validator'
    purpose: 'code and prompt validation via AI models'
---

# validation

<module_purpose>
Module unit for validating code and prompts via AI models. Provides TypeScript/JavaScript code quality checks and prompt consistency testing.
</module_purpose>

<contract>
**Behavioral (what module MUST do):**

- Invariant: validation result always contains score 0-100
- Guarantee: returns error on API unavailability, never hangs

**API Contract:**

- Input: `ValidationInput` — file ≤100KB, valid path or content
- Output: `ValidationResult` — score: number, issues: Issue[], passed: boolean
- Errors: `FileNotFoundError`, `FileTooLargeError`, `APITimeoutError`
- Side effects: HTTP requests to OpenRouter API
  </contract>

<design_decisions>
**Why this approach was chosen:**

- Decision: synchronous file processing with caching
- Rationale: predictable behavior more important than parallelism for validation
- Alternatives: async queue (rejected: debugging complexity)

**Implementation notes:** result cache by file hash for 5 minutes
</design_decisions>

<business_context>
**Why module exists:**

- Business goal: automated code quality checks in CI/CD
- Users: agent-mode-workflow, CLI commands
- Criticality: high (blocks low-quality code)
  </business_context>

<edge_cases>
**Edge cases:**

- Empty file: returns score 100, empty issues list
- File >100KB: throws FileTooLargeError without API call
- API timeout: retry 3 times with exponential backoff, then APITimeoutError
  </edge_cases>

<public_api>
**Functions:**

- `validateCode(input: ValidationInput): Promise<ValidationResult>` — code validation
- `testPrompt(prompt: string, options: TestOptions): Promise<TestResult>` — prompt testing

**Types:**

- `ValidationInput` — input data (type: 'file'|'content', data: string)
- `ValidationResult` — result (score, issues, passed)
  </public_api>

<dependencies>
**Node.js:** node:fs, node:crypto
**External:** openai, zod
**Internal:** ../adapters/openrouter-client
</dependencies>
```

</example>

</module_examples>

## TIER 6: Required Elements Checklist

<required_elements>

**Required sections (in order):**

1. `<module_purpose>` — 2-3 sentences, responsibility scope
2. `<contract>` — behavioral invariants + API contract (CRITICAL)
3. `<design_decisions>` — WHY this approach, alternatives considered
4. `<business_context>` — business goal, users, criticality
5. `<edge_cases>` — boundary conditions and handling
6. `<public_api>` — exported functions and types (brief)
7. `<dependencies>` — categorized imports

**YAML metadata:**

- `documentation_type: 'ai-module-documentation'`
- `module_context` with name, path, parent_package, purpose

**What NOT to include (duplicates code):**

- Detailed XML file structure (code is the source of truth)
- Full type definitions (available in types.ts)
- Implementation details (available in source files)

</required_elements>

[REFERENCE-END]

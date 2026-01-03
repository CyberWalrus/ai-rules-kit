---
id: architecture-xml-generator-v1
type: algorithm
alwaysApply: false
---

# 🏗️ Architecture XML Generation Prompt

[ALGORITHM-BEGIN]

## TIER 1: Expert Role

<expert_role>
You are an elite Architecture XML Generator for complex workspace packages and FSD layers.
Goal: generate well-formed XML architecture files exactly following the `architecture_docs` policy from the package's `package-ai-docs.md`.
Targets: Claude, GPT, Gemini, Qwen (cross-model compatible, deterministic formatting).

STRICT RULES:

- Output must be valid XML (UTF-8), no BOM, no XML declaration prolog.
- No ASCII file trees or markdown tables. Structure ONLY via XML tags.
- Use Russian for human-readable labels in attributes `role`/`purpose` (as in references), keep tag/attr names in English.
- Keep stable ordering: directories A→Z, then files A→Z.
- Use self-closing `<file .../>` for leaf files; indent with 2 spaces.
- Do not include unrelated folders (`node_modules`, `dist`, `.git`, `coverage`).
- Include a `<meta>` block with freshness fields described below.
  </expert_role>

## TIER 2: Algorithm

<algorithm_motivation>
We will proceed in a structured way to reliably generate architecture XML files that are deterministic, valid, and aligned with the package's `architecture_docs` policy. Each step defines inputs, decisions (format, sectioning), schema, and emission rules to ensure reproducibility and cross-model consistency.
</algorithm_motivation>

<algorithm_steps>

<cognitive_triggers>
Think step by step about: (1) which `format` to emit (bundle/single/multi), (2) how to map `architecture_type` to sections/modules, (3) how to ensure deterministic ordering and valid XML without markdown, (4) where to place freshness metadata.
</cognitive_triggers>

### Step 1: Inputs and Context

- You will receive (or infer) from `package-ai-docs.md`:
    - `package_context`: `name`, `architecture_type`, `workspace_path`
    - `architecture_docs`: `format` (`bundle`|`single`|`multi`), `root`, `files` (for bundle/multi)
- Source root is typically `src` unless explicitly provided.
- If VCS data is provided, capture the latest commit hash as `source_revision`.
- **CRITICAL:** Before generation, consult the master architectural references for rules:
    - [`architecture.md`](.cursor/docs/architecture.md) (General principles and XML schemas)
    - [`architecture-single-module.md`](.cursor/docs/architecture-single-module.md)
    - [`architecture-layered-library.md`](.cursor/docs/architecture-layered-library.md)
    - [`architecture-fsd-standard.md`](.cursor/docs/architecture-fsd-standard.md)
    - [`architecture-fsd-domain.md`](.cursor/docs/architecture-fsd-domain.md)
    - [`architecture-server-fsd.md`](.cursor/docs/architecture-server-fsd.md)
    - [`architecture-multi-app-monolith.md`](.cursor/docs/architecture-multi-app-monolith.md)

<completion_criteria>
Inputs mapped to internal variables, missing values resolved conservatively or marked as `unknown`.
</completion_criteria>

<exception_handling>
If `architecture_docs` is missing, assume `format: single`. The file `architecture.xml` should be in the package root.
If `architecture_type` is unknown, infer from directory names or set `architecture_type: 'unknown'`.
</exception_handling>

### Step 2: Plan Outputs by Format

The file output strategy is determined by the `architecture_docs.format` field from `package-ai-docs.md`. If this field is missing, the default is `single`.

- **`single` format:**
    - **Output:** A single file named `architecture.xml`.
    - **Location:** MUST be in the root of the package.
    - **Content:** Contains the full `<package_root>` structure.

- **`bundle` format:**
    - **Output:** A root file (typically `index.xml`) and multiple section files (`lib.xml`, `ui.xml`, etc.).
    - **Location:** All files MUST be in an `architecture/` directory within the package root.
    - **Content:** The root file contains `<sections>` referencing the section files. Each section file contains a partial `<package_root>`.

- **`multi` format:**
    - **Output:** Multiple independent XML files.
    - **Location:** All files MUST be in an `architecture/` directory within the package root.
    - **Content:** Each file represents a section and contains a partial `<package_root>`.

<completion_criteria>
Clear list of files to produce with names and purposes, consistent with `architecture_docs`.
</completion_criteria>

<exception_handling>
If a referenced section lacks a name, derive it from the filename without the extension.
If `files` is empty for `bundle`/`multi`, fail safely by generating a `single` format file with the full structure.
</exception_handling>

### Step 3: XML Schema (Canonical Tags)

All architecture XML files MUST follow this canonical shape, aligned with `validate-architecture.md`:

```xml
<architecture format="bundle|single|multi" version="2.0" [section="name"]>
  <architecture_metadata version="1" language="ts">
    <architecture_type>layered_library|fsd_standard|fsd_domain|single_module|server_fsd|multi_app_monolith</architecture_type>
    <package_name>@scope/package</package_name>
    <workspace_path>executables/tools/mcp-validator</workspace_path>
    <source_root>src</source_root>
    <entrypoints>
      <entrypoint path="src/index.ts" />
    </entrypoints>
    <ruleset>${PROJECT_NAME}-2025-10</ruleset>
    <source_revision>git:HEAD_SHA</source_revision>
    <generated_at>2025-01-01T00:00:00Z</generated_at>
    <validator_min_version>1</validator_min_version>
  </architecture_metadata>

  <!-- bundle only -->
  <sections>
    <section name="lib" src="lib.xml"/>
    <section name="ui" src="ui.xml"/>
  </sections>

  <!-- single or section content -->
  <package_root>
    <source_directory name="src">
      <!-- layered_library example -->
      <layer name="lib" purpose="общие утилиты и helpers">
        <module name="format-date">
          <facade name="index.ts" role="unit_facade"/>
          <file name="format-date.ts" role="function"/>
        </module>
      </layer>
      <layer name="ui" purpose="визуальные компоненты">
        <module name="button">
          <facade name="index.ts" role="unit_facade"/>
          <file name="Button.tsx" role="component"/>
        </module>
      </layer>
    </source_directory>

    <tests_directory name="__tests__">
      <test name="lib/format-date.test.ts" role="unit_test"/>
      <test name="ui/button.test.tsx" role="unit_test"/>
    </tests_directory>

    <config_files>
      <file name="package.json" role="метаданные проекта"/>
      <file name="tsconfig.json" role="конфигурация TypeScript"/>
      <file name="vitest.config.ts" role="конфигурация тестов"/>
    </config_files>

    <documentation>
      <file name="README.md" role="пользовательская документация"/>
      <file name="package-ai-docs.md" role="AI документация пакета"/>
    </documentation>
  </package_root>
</architecture>
```

<completion_criteria>
All required tags present: `<architecture>`, `<architecture_metadata>`, and either `<sections>` or `<package_root>`.
Attributes use kebab-case file paths relative to package root; indentation is 2 spaces.
</completion_criteria>

<exception_handling>
If a section is empty, include the tag with a comment explaining the omission is intentional.
If paths exceed 120 chars, keep relative shortening while preserving uniqueness.
</exception_handling>

### Step 4: Architecture Type Mappings

Map `architecture_type` to sectioning strategy:

- `single_module`: one `<package_root>`; no `<module>` splits unless helpful.
- `layered_library`: sections/modules for `lib`, `ui`, `model`, `api` if present.
- `fsd_standard`|`fsd_domain`: split by layers `pages`, `widgets`, `features`, `entities`, `shared` (and domains for `fsd_domain`).
- `server_fsd`: split by `controllers`, `services`, `models`, `repositories`, `middleware`, `config`.
- `multi_app_monolith`: group by app folders under `src/{app}/` plus `common` application.

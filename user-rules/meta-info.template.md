---
id: user-meta-info
type: compact
alwaysApply: true
current_date: "${CURRENT_DATE}"
---

# User Meta Info

<user_meta>

**SOURCE OF TRUTH:** Treat this context as authoritative; always prefer it over assumptions.

**CURRENT DATE:** ${CURRENT_DATE} (apply to all time-sensitive operations, versioning, timestamps)

**User Profile:**

- Name: ${NAME}
- Age: ${AGE}
- Role: ${ROLE}

**Technical Environment:**

- Primary Stack: ${STACK}
- Tool Versions: ${TOOL_VERSIONS}
- Operating System: ${OS}
- Hardware: ${DEVICE}
- Environment: Cursor IDE (AI-first code editor, VS Code-based)

**Location & Communication:**

- Location: ${LOCATION}
- Language: ${LANGUAGE}
- Communication Style: ${COMMUNICATION_STYLE}

**ВАЖНО: Все ответы должны быть на русском языке.**

<completion_criteria>
Context internalized, tool versions verified, current date (${CURRENT_DATE}) applied to temporal operations.
</completion_criteria>

</user_meta>

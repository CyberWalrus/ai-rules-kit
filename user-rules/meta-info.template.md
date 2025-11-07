---
current_date: "${CURRENT_DATE}"
---

# User Meta Info

<context_preservation>
**REMEMBER:** Never lose information from this user context during conversations. This data must persist throughout the entire session.

**CRITICAL - TEMPORAL CONTEXT:**

- **CURRENT DATE IS:** ${CURRENT_DATE}
- **MANDATORY:** Always use this date when working with time-sensitive data, versioning, timestamps, or any temporal logic
- **NEVER ASSUME:** Do not use training cutoff date or any other date - use ONLY the date specified above
</context_preservation>

<user_context>

## Temporal Context

**⚠️ CURRENT DATE (USE THIS IN ALL TIME-RELATED OPERATIONS):** ${CURRENT_DATE}

## User Profile

- **Name:** ${NAME}
- **Age:** ${AGE}
- **Role:** ${ROLE}

## Technical Environment

- **Primary Stack:** ${STACK}
- **Operating System:** ${OS}
- **Hardware:** ${DEVICE}

## Execution Context

- **Environment:** Cursor IDE (AI-first code editor, VS Code-based)

## Location & Communication

- **Location:** ${LOCATION}
- **Language:** ${LANGUAGE}
- **Communication Style:** ${COMMUNICATION_STYLE}

</user_context>

<completion_criteria>

- [ ] User context internalized and retained in memory
- [ ] Technical preferences and background understood
- [ ] Communication style adapted accordingly
- [ ] **Current date (${CURRENT_DATE}) remembered and will be used for all time-sensitive operations**

</completion_criteria>

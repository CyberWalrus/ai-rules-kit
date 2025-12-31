---
id: current-date
type: compact
alwaysApply: true
current_date: '${CURRENT_DATE}'
---

# Current Date Context

<current_date_context>

**🚨 ZERO TOLERANCE — TODAY:** ${CURRENT_DATE}

Training cutoff and system date are IRRELEVANT. Only ${CURRENT_DATE} matters.

**RULES:**

1. "now", "today", "current", "latest", "recent" → resolve to ${CURRENT_DATE}
2. All searches (Web, Context7, docs) → anchor to ${CURRENT_DATE}
3. Version recommendations → valid as of ${CURRENT_DATE}

**FORBIDDEN:**

- Training cutoff for temporal reasoning
- Versions released after ${CURRENT_DATE}
- "Current" claims without ${CURRENT_DATE} verification

**⚡ MOTIVATION:**

✅ Correct date → accurate info, valid versions, trust
❌ Wrong date → broken deps, hallucinations, FAILURE

**🚨 ANTI-SHORTCUTS:**

"Training data is recent" → WRONG! Cutoff ≠ current.
"User didn't specify" → WRONG! ${CURRENT_DATE} is above.
"Probably works" → WRONG! Verify or state uncertainty.

**REALITY:** 90% outdated recommendations = ignored current date. NEVER acceptable.

</current_date_context>

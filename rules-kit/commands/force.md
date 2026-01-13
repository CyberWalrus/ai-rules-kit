---
id: force-mode-check
type: command
---

# Force Mode Check

**🚨 BLOCKING PROTOCOL - ZERO TOLERANCE:**

**STEP 1 - MANDATORY FIRST ACTION (NO TOOLS BEFORE THIS):** Check system_reminder for `[MODE_INITIALIZED:` marker. If marker NOT FOUND → you MUST read `.cursor/rules/01-chat-mode-router.mdc` → determine current mode by priority → announce mode in format `[MODE_INITIALIZED: {MODE_NAME}] → 📄 {path} → Reading and strictly following core instructions` → output marker.

**STEP 2 - IF PLAN_MODE:** After mode announcement → you MUST read `.cursor/rules/plan-mode-dispatcher.mdc` → classify task type using algorithm → announce type in format `📋 [type] → 📄 .cursor/rules/[name].mdc → Following as primary instructions` → read workflow file → output blocking reminder.

**STEP 3 - VERIFICATION:** Before ANY other tool calls, verify: [ ] Mode announced and marker output, [ ] If PLAN_MODE → type classified and announced, [ ] Rules files read. **IF ANY CHECK FAILS → STOP → execute missing steps NOW.**

**FORBIDDEN:** Tool calls before mode check, skipping protocol, "simple task" excuses. **NO EXCEPTIONS** → protocol MANDATORY even for trivial requests.

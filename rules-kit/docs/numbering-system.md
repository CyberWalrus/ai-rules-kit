---
id: numbering-system
type: reference
alwaysApply: false
---

# 📖 Numbering System

<numbering_system>

## Notation Rules

**Separators:** `--` (hierarchy) | `_` (modifiers)

**Core Hierarchy (4 levels):**

- `P{n}` = Phase | `S{n}` = Step | `T{n}` = Task | `B{n}` = Block

**Modifiers (apply to any level):**

- `R{n}` = Run (iteration number)
- `V{n}` = Variant (alternative path)
- `C{n}` = Concurrent (parallel group)
- `F` = Fallback (error recovery, always last)

**Modifier Order:** `_R{n}_V{v}_C{c}_F`

---

## Format & Semantics

**Fallback Logic:**

- `_F` = flag indicating fallback exists for this level
- `T3_F` → If T3 fails, execute its fallback
- Always last modifier in chain
- One fallback per level maximum
- Example: `T4_V2_C1_F` = "Try T4 Variant 2 in Concurrent 1, if fails → fallback"

**Run Semantics:**

- Applies at any level: `P2_R3`, `S1_R2--T4`, `T5_R1--B2`
- **R{n} = iteration number** (not repetition count)
- Independent counters: `P2_R3--S1_R1--T4_R2` = P2(3rd run) → S1(1st) → T4(2nd)

**Concurrent Synchronization:**

- All tasks in `C{n}` group execute in parallel
- **Sync point:** After last T in C{n}, before next serial task
- All C{n} tasks must complete before proceeding

**Concurrent + Fallback:**

- `T1_C1_F` = fallback applies only to T1, not entire C1 group
- Other tasks in C1 continue independently
- Example: If T1_C1_F fails → T1 fallback executes, while T2_C1, T3_C1 continue

---

## Decision Tree

### Run vs Variant

**R{n}** - Same logic repeated: `P2_R1, P2_R2` (function 1, 2)
**V{n}** - Different approaches: `P2_V1` (REST), `P2_V2` (GraphQL)

### When Concurrent

**Use C{n}:**

- ✅ No data dependencies
- ✅ Operations run simultaneously

**Don't use:**

- ❌ Sequential order matters
- ❌ Shared mutable state

### When Fallback

**Use F:**

- ✅ Critical step + backup plan exists

**Don't use:**

- ❌ Simple error + stop
- ❌ User intervention required

---

## Examples

**Basic:** `P1--S2--T3--B1`

**Variants:** `P1--S2_V1--T3_V2`

**Fallback:** `T3_F` (if T3 fails → execute fallback) | `T4_V2_F` (variant + fallback)

**Iteration:** `P2_R3--S1_R1--T4_R2` (multi-level runs)

**Concurrent + Fallback:** `P1--S2--T1_C1_F`

- Fallback only for T1 (not entire C1 group)
- If T1 fails: T1 fallback executes, other C1 tasks continue

**Concurrent group:**

```
P1--S2--T1_C1 ┐
P1--S2--T2_C1 ├─ Parallel group C1
P1--S2--T3_C1 ┘→ [SYNC]
P1--S2--T4     ← Serial after sync
```

**Complex:** `P1_R2--S3_V1--T4_V2_C1_F--B2`

**Valid patterns:**

- `T4_R1_V2_C1` ✅
- `T4_V2_F` ✅
- `T4_C1_F` ✅
- `P1--S2--T1_C1_F` ✅

---

## Real-world Use Cases

**Scenario 1: Develop 3 similar functions**

```
P2_R1--S1--T1 (validateUser function)
P2_R2--S1--T1 (validateProduct function)
P2_R3--S1--T1 (validateOrder function)
```

**Scenario 2: Refactor 5 files in parallel**

```
P1--S3--T1_C1 (user.ts)
P1--S3--T2_C1 (product.ts)
P1--S3--T3_C1 (order.ts)
P1--S3--T4_C1 (payment.ts)
P1--S3--T5_C1 (shipping.ts) → [SYNC]
```

**Scenario 3: Try REST API, fallback to GraphQL**

```
P1--S2--T3_V1_F
V1 = REST implementation
Fallback = GraphQL implementation
```

**Scenario 4: Complex multi-step workflow**

```
P1_R2--S3_V1--T4_V2_C1_F--B2
= Phase 1 (2nd run) → Step 3 (variant 1) → Task 4 (variant 2 in concurrent group 1 with fallback) → Block 2
```

---

## Validation Checklist

Before using notation, verify:

- ✅ **F position:** Is F the last modifier in chain?
- ✅ **Run counters:** Are run counters independent per level?
- ✅ **Sync points:** Is [SYNC POINT] documented for concurrent groups?
- ✅ **Modifier limit:** Max 2-3 modifiers per level?
- ✅ **Run vs Variant:** Using Run for same logic, Variant for different approaches?
- ✅ **Fallback validity:** Does fallback have actual backup plan?
- ✅ **Concurrent deps:** No data dependencies between C{n} tasks?

---

## FAQ

### Q1: Repeating development cycle?

**A:** Use `P2_R1, P2_R2, P2_R3` for iterations of same logic

### Q2: Concurrent for parallel reads?

**A:** Yes: `P1--S1--T1_C1, T2_C1, T3_C1, T4_C1 → [SYNC POINT]`

### Q3: Concurrent + Fallback behavior?

**A:** `T1_C1_F` = fallback applies only to T1, not entire C1

- If T1 fails → T1 fallback executes
- Other C1 tasks (T2_C1, T3_C1) continue parallel
- All must complete before [SYNC POINT]

### Q4: Multi-level independent counters?

**A:** `P2_R3--S1_R1--T4_R2` = each level has own iteration

- P2 is on 3rd run
- Within that P2, S1 is on 1st run
- Within that S1, T4 is on 2nd run

---

## Common Patterns

**Parallel files:**

```
P1--S1--T1_C1, T2_C1, T3_C1, T4_C1 → [SYNC]
```

**Iterative cycle:**

```
P2_R1--S1--T1 (function 1)
P2_R2--S1--T1 (function 2)
P2_R3--S1--T1 (function 3)
```

**Fallback:**

```
P1--S2--T4_F
Try: architecture-layered-library.md
Fallback: architecture.md
```

**Concurrent + Fallback combo:**

```
P1--S2--T1_C1_F ┐
P1--S2--T2_C1   ├─ Parallel (only T1 has fallback)
P1--S2--T3_C1   ┘→ [SYNC]
P1--S2--T4      ← T1 fallback doesn't block C1 sync
```

**Multi-level F:**

```
P1_F → Phase 1 fallback
  ↓
P1--S2_F → Step 2 fallback (independent from P1_F)
  ↓
P1--S2--T3_F → Task 3 fallback (independent from S2_F)
```

Each level has own fallback, triggered independently.

---

## Anti-patterns

❌ **Wrong modifier order:** `T4_F_V2`, `T4_C1_V2` → Use `_R_V_C_F`
❌ **Too many modifiers:** `T1_R1_V1_C1_F` → Keep max 2-3
❌ **Fallback everywhere** → Only where fallback exists
❌ **Concurrent without sync docs** → Always document [SYNC POINT]
❌ **Run for different logic** → Use Variant instead
❌ **Nested concurrent:** `T1_C1--B1_C2` → Not allowed

---

## Usage Guidelines

- **Task vs Block:** Task = independent context/delegation; Block = atomic steps within same context
- **Variant vs Fallback:** Variant = planned alternative; Fallback = error recovery
- **Concurrent:** Only when no data dependencies; always document sync points
- **F scope:** Applies to complete modifier chain at that level only

**IMPORTANT:** Use this numbering for task tracking and progress documentation.

**Common Misconception:**

- ❌ **Misconception:** `T1_C1_F` blocks entire C1 group
- ✅ **Reality:** Only T1 has fallback; other C1 tasks continue parallel

</numbering_system>

# CLAUDE.md — Code Texture Constitutions (74 Rules)
# GitHub Copilot: Apply all relevant rules to every file you touch.

## SECTION 1 — Core Philosophy
1.  Code Is Written for Humans First — clarity over cleverness
2.  Intent Over Implementation — function names explain the why
3.  Explicit Is Better Than Implicit — no magic values or ambiguous defaults

## SECTION 2 — Naming
4.  Human-Readable Naming — calculateInvoiceTotal() not calcInvTot()
5.  Verb-First Functions, Noun-First Data — fetchTransactions not getTransData
6.  No Abbreviations Unless Universal — configuration not cfg
7.  Domain Language — approveLoan() not setStatus(3)

## SECTION 3 — Structure
8.  Functions Do One Thing — if description needs "and", split it
9.  Shallow Nesting — guard clauses, max 2-3 levels deep
10. Linear Reading Flow — validate -> authorize -> process -> persist -> return
11. Small Predictable Files — 200-400 lines soft limit

## SECTION 4 — Algorithms
12. Correctness Before Optimization
13. Optimal Complexity — hash maps over nested loops, O(n) preferred
14. No Premature Micro-Optimizations
15. Performance-Critical Paths Documented — comment why, not what

## SECTION 5 — Control Flow
16. Command-Style Flow — validateInput -> authorizeUser -> processRequest
17. No Hidden Side Effects — functions do exactly what their name says
18. Predictable State Transitions — no silent mutations

## SECTION 6 — Error Handling
19. Errors Are First-Class — typed error codes from registry in README.md
20. Fail Fast, Fail Loud, Fail Clearly — validate early, throw meaningful errors
21. No Swallowed Exceptions — every catch handles or re-throws with log

## SECTION 7 — AI Collaboration
22. AI Code Must Look Human — naming, structure, docs match senior engineer
23. Templates Mandatory — follow AGENTS.md templates always
24. No Clever One-Liners — multi-line clarity over compact tricks
25. Comments Explain Why Not What — trade-offs, constraints, assumptions

## SECTION 8 — Modularity
26. Clear Module Boundaries — Router->Service only, Service->Repository only
27. Replaceability — interfaces abstract implementations
28. Consistent Patterns — same structure for every router, service, repository

## SECTION 9 — Testing
29. Code Must Be Easy to Test — dependency injection, pure functions
30. Tests Are Readable Specifications — "should reject viewer creating transaction"
31. Deterministic Behavior — same input always produces same output

## SECTION 10 — Maintainability
32. New Engineers Onboard Fast — minimal tribal knowledge
33. Refactoring Is Safe — small functions, loose coupling
34. No Dead Code — remove unused functions aggressively
35. Consistent Formatting — Ruff (Python), Biome (JS)

## SECTION 11 — Production
36. Logging Is Intentional — structured JSON, correlation_id on every entry
37. No Sensitive Data In Logs — passwords, tokens, PII never logged
38. Configuration Over Hardcoding — env vars for all secrets

## SECTION 12 — Scale
39. Code Must Survive Scale
40. Intentional Incompleteness — explicit TODO(reason), never silently ignore
41. Assumption Declaration — comment assumptions near the logic
42. Boundary Validation Only — validate at router/schema, not in service
43. Deterministic Side Effects — separate pure logic from effect layers
44. Concurrency Visibility — explicit DB transactions
45. Partial Failure Awareness — handle timeouts separately from errors
46. Non-Blocking by Default — async preferred
47. Precision Over Convenience — explicit params over magic
48. Read-Path Optimization — reads simpler than writes
49. Write-Amplification Awareness — batch writes
50. Backward-Readable Code — old code stays understandable
51. Debuggability Over Cleverness — clear at 3 AM
52. Failure Injection Readiness — DI enables fault simulation
53. Temporal Coupling Avoidance — no implicit call-order assumptions
54. Migration-Friendly — feature flags, backward-compatible paths
55. Resource Lifetime — context managers, always close what you open
56. API Stability — never break without versioning
57. Dependency Isolation — pinned versions, lockfiles
58. Side-Effect Visibility — DB/network/file ops in repositories only
59. API Surface Minimization — private by default
60. State Explosion Prevention — FSM for complex flows
61. Correct-by-Construction — types encode invariants
62. Isolation of Mutability — immutability default
63. Cognitive Load Budget — no deep indirection
64. On-Call Survivability — debuggable at 3 AM

## SECTION 13 — Frontend Contracts
65. API Contract First — derive component props from shared-types
66. Component Responsibility — Service -> Hook -> Component, never skip
67. Loading, Error, Empty State — every async component handles all three
68. Client/Server Boundary — explicit "use client" or "use server" on every file

## SECTION 14 — Database
69. Migration Immutability — append-only, never edit committed migrations
70. Null Safety — every nullable column has explicit null handling
71. Index Intentionality — every index has a documented query justifying it

## SECTION 15 — Testing
72. Test Naming Is a Specification — "should return 403 when viewer creates transaction"
73. Arrange-Act-Assert — three sections, blank-line separated
74. Edge Case Documentation — file header lists covered and skipped edge cases

# Checkpoint A: M0 review and M1 go/no-go (DOM-009)

Prepared 2026-11-09 from the repo and the board. The checks below are factual. Items that need a person (the spoken explanation, the mentor, the reflection answers) are marked **Pending** and have not been done.

## Verdict: NO-GO for M1 (not yet)

M0 content is drafted and consistent, but four of the exit conditions cannot be met until a person acts. None of the gaps is large.

## 1. M0 Definition of Done

| Condition | Result | Evidence |
|---|---|---|
| Explain the life of a bill in under 2 min, no notes | **Pending** (needs you, aloud) | Practice script: [life-of-a-bill-script.md](life-of-a-bill-script.md). Record or note the attempt in the table at the bottom. |
| Every §3.1 entity has exactly one owner | **Pass** | [architecture.md §2](../../architecture.md): all 14 §3.1 entities map to one service. The context map boxes in `diagrams/context-map.mmd` match the table (checked by reading both). |
| Spreadsheet reproduces all three totals | **Pass** | `node billing-check.mjs` run 2026-11-09: A 2037.81, B 324.80, C 2567.04, all MATCH. The script regenerates `billing-spreadsheet.csv`; the repo has no commits, so I could not diff the CSV against the earlier copy. |
| Mentor has reviewed the context map | **Blocked** | No mentor named. Q-11 is `open`. |

## 2. Prerequisite: DOM-001 to DOM-008 in Review or Done

Not met. Board state:

| Card | Column | Remaining |
|---|---|---|
| DOM-001 (#1) | **Doing** | Repo host decision (Q-02); create the remote and protect `main`. Repo has no commits and is unpushed. |
| DOM-002 (#2) | Review | 2 items unticked |
| DOM-003 (#3) | Review | 1 item unticked |
| DOM-004 (#4) | Review | 1 item unticked (likely the mentor review) |
| DOM-005 (#5) | Review | Complete |
| DOM-006 (#6) | Review | Complete |
| DOM-007 (#7) | Review | ADR-0001 still **Proposed**; peer review needed to set Accepted |
| DOM-008 (#8) | **Doing** | Fictional-utility decisions, schedule baseline and mentor, no open M1 blockers |

## 3. M1 ready-to-start check

Documented: domain objects (glossary, architecture §2) and service ownership (architecture §2, context map). That part passes.

`assumptions.md` says nothing that blocks M1 may be `open`. No entry that blocks M1 is `open`, but these are only `proposed` and need an owner's sign-off:

- Q-08 route vs route-assignment ownership (Customer owns routes, Reading owns assignments). Directly shapes the M1 schema.
- Q-21 currency (`USD`, integer cents).
- Q-01a, Q-01b, Q-01d: utility name, zones, account-number format. Needed for M1 seed data and account creation.

These `open` items block M0 itself: Q-02 repo host, Q-10 schedule baseline, Q-11 mentor. Every Owner field is still `TBD`.

## 4. What to do to flip this to GO

1. Name the mentor (Q-11) and send them `architecture.md` plus the context map. Record their feedback in `evidence/m0-domain/mentor-feedback.md`.
2. Decide the repo host (Q-02), create the remote, make the first commit and push. Record an ADR if Gitea.
3. Fix the schedule baseline (Q-10) and assign owners in `assumptions.md`.
4. Sign off the `proposed` items above, then set ADR-0001 to Accepted after review.
5. Give the 2-minute explanation and log it below.
6. Answer the three reflection questions in `journal.md` in your own words. The drafts there are positions to react to, not your answers.
7. Move DOM-001 and DOM-008 to Review, then tick the card.

## 5. Log of the spoken explanation

| Date | Reviewer / recording | Time | Notes without notes? |
|---|---|---|---|
| | | | |

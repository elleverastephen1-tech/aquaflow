# Development journal

3–5 lines per working session: what you did, what confused you, what you learned. Answer each milestone's reflection questions here. Newest entries go at the top.

---

## 2026-10-27 · M0 kickoff (prepared by Claude for jayzero0)

- **Did:** Read the Learning Roadmap and the Development Plan. Created the M0 cards (#86–#95) and drafted the M0 documents: README, contributing rules, glossary, user stories, context map and architecture, billing check, edge cases, ADR-0001 (Proposed), event catalog and assumptions log. Initialised the repo locally; it is not pushed until the repo host is decided (Q-02).
- **Verified:** `node docs/evidence/m0-domain/billing-check.mjs` reproduces $2,037.81, $324.80 and $2,567.04 to the cent, using integer cents and half-up rounding on each percentage line.
- **Confusing:** The penalty is "applied 3 days after the due date" yet appears on the *next* bill (resolved as Q-05). The Dev Plan's DB inventory lists `payment_db` twice, has no `notification_db` and puts route assignments in two databases (Q-08, Q-09). The two documents split the 29 weeks differently (Q-10).
- **Next:** Decide the repo host, schedule baseline and mentor. Peer-review the glossary, stories and context map. Hold Checkpoint A (DOM-009).

### M0 reflection questions (to be answered by the learner after review)
- Why is a *meter* a separate entity from an *account*? What breaks if you merge them?
- Which service should own the "previous reading" used to compute consumption? Why? *(Draft position: Reading; see architecture.md D-2.)*
- What are you giving up by choosing microservices over a modular monolith? *(Draft: see ADR-0001.)*

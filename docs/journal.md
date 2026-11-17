# Development journal

3–5 lines per working session: what you did, what confused you, what you learned. Answer each milestone's reflection questions here. Newest entries go at the top.

---

## 2026-11-13 · M0 reflection answers (by stephen.1, reviewed with Claude)

- **Did:** Rehearsed the life-of-a-bill explanation and answered the three M0 reflection questions. The 2-minute explanation has not yet been said aloud to a person or recording.
- **Learned:** Ownership means which service stores, changes and answers for data, not who benefits from seeing it. Customer and account are different entities (one customer, many accounts). Readings belong to Reading, not to the meter.

### M0 reflection answers
**1. Why is a meter a separate entity from an account? What breaks if you merge them?**
A meter is a separate entity because a meter can be replaced without changing the account number. If they are merged, old meter readings and consumption history could be lost or mixed with the new meter's readings, resulting in incorrect billing. Keeping them separate allows the system to track meter replacements and maintain accurate reading and billing records.

**2. Which service should own the "previous reading" used to compute consumption? Why?**
Reading owns the previous reading because it uses it to calculate consumption and creates or updates it after every approved reading. Customer only provides the initial and final meter readings during installation or replacement. Billing just receives the calculated consumption for bill computation.

**3. What are you giving up by choosing microservices over a modular monolith?**
1. *Distributed transactions.* When Billing issues a bill, it debits the customer's ledger and saves the bill PDF. If the ledger debit succeeds but the PDF fails to save, the two operations become inconsistent because they use separate databases and services. Unlike a monolithic system, AquaFlow cannot use one database transaction to undo both operations automatically. Billing therefore needs retry mechanisms and compensating actions to recover from failures.
2. *Error handling and service availability.* During a bill run, Billing needs approved meter readings from Reading to calculate customer consumption and charges. If Reading becomes unavailable or its events are delayed, Billing may not have the necessary data to generate accurate bills. Because the services communicate through network calls and events, AquaFlow must handle timeouts, retries and failed messages instead of relying on direct communication within one application.
3. *Monitoring and debugging.* When a customer makes a payment, Payment publishes `payment.payment.received`, which Billing must process to credit the ledger and clear the outstanding balance. If the event is delayed or fails to reach Billing, Payment may show a successful payment while Billing still shows the customer as owing money. Developers must check logs and trace events across multiple services to identify where the problem occurred, making debugging more difficult than in a monolithic system.

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

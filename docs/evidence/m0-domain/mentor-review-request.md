# AquaFlow: review request for the context map and service boundaries

Sent by: stephen.1 · Needed by: 2026-11-26 (end of M0, Checkpoint A) · Time needed: about 20 minutes

## What AquaFlow is
A fictional water utility ("Riverbend Water District") with a billing system built as separate services. Field staff submit meter readings, officers review the odd ones, the system produces bills, and customers pay online. It is a learning project, so the design is more distributed than a real utility of this size would need. ADR-0001 explains why.

## What to read
Repo: https://github.com/elleverastephen1-tech/aquaflow (if you can't open it, ask me for the files)

1. `docs/architecture.md` §1 (context map), §2 (who owns each entity) and §3 (boundary decisions D-1 to D-5)
2. `docs/diagrams/context-map.mmd`, the same map as source
3. Optional: `docs/adr/0001-adopt-microservice-architecture.md`

Solid arrows are synchronous HTTP. Dotted arrows are asynchronous events. Each box lists the entities that service owns.

## Questions
Short answers are fine. "Looks fine" and "change this" are both useful.

1. **Ownership.** Does every entity in the §2 table have one clear owner? Is any entity in the wrong service?
2. **Routes (D-1).** Customer owns routes (which addresses are on which route). Reading owns route assignments (which reader reads which route in which period). Is that a sensible split?
3. **Previous reading (D-2).** Reading owns the previous reading used to compute consumption. Customer only supplies the first and last readings of a meter installation. Billing receives consumption and never computes it. Do you agree?
4. **Service size.** Is any service doing too much, or too little? Should anything be merged or split?
5. **Dependencies.** Are there any arrows that look wrong, missing, or likely to cause trouble later, such as services that call each other too often?
6. **Sync vs async.** Billing pulls consumption from Reading over HTTP at first, then moves to events (D-5). Reading asks Customer for meter data over HTTP at first, then keeps a local copy (D-3). Is that a reasonable way to start?

## Your feedback
Please write below, or reply by message and I will paste it in with your name and the date.

| | |
|---|---|
| Reviewer name and role | |
| Date | |
| Q1 Ownership | |
| Q2 Routes | |
| Q3 Previous reading | |
| Q4 Service size | |
| Q5 Dependencies | |
| Q6 Sync vs async | |
| Anything else | |
| **Verdict** (tick one) | ☐ Approved ☐ Approved with changes ☐ Needs rework |

Feedback gets saved to `docs/evidence/m0-domain/mentor-feedback.md`.

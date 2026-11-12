# Assumptions and open questions

Rule from both source documents: *"If a requirement is ambiguous, create an explicit assumption or ADR rather than silently inventing behavior."*

**Status values:** `open` (nobody has decided; may block work), `proposed` (a default is written, waiting for sign-off), `decided` (agreed; link the ADR or card), `superseded`.

**Owner** is the person who decides. Owners are assigned at kickoff. **Blocks** is the earliest milestone that cannot finish without an answer.

Nothing that blocks M1 may still be `open` at Checkpoint A (card DOM-009).

## Project and process

| ID | Question / gap | Proposal | Owner | Status | Blocks | Settled by |
|---|---|---|---|---|---|---|
| Q-02 | **Repo host, CI and registry.** Both PDFs assume GitHub, GitHub Actions and GHCR. The team's Git connection is Gitea (shards.project-moonshot.com). | **GitHub**, with GitHub Actions and GHCR, as both PDFs assume. No ADR is needed because the plan is unchanged. Still to do: connect a GitHub account/org, create the remote and push. The repo is local and unpushed until then. | stephen.1 | decided (2026-11-12) | M0 (push), M9 | DOM-001 (#1) |
| Q-10 | **Schedule baseline.** Both total 29 weeks but split them differently. Roadmap: M0 = week 1, M1 = weeks 2–3, M3 = 1.5 weeks, M6 = 3 weeks. Dev Plan: M0 = weeks 1–2, M1 = weeks 3–4, M3 = 2 weeks, M6 = 2 weeks. | Track the **Dev Plan** schedule, because it is the implementation plan and gives M0 two weeks. A start date is needed to set card due dates. | TBD | **open** | M0 | DOM-008 (#93) |
| Q-11 | **Mentor / reviewer** for Checkpoints A–F. | – | TBD | **open** | M0 (Checkpoint A) | DOM-008 (#93) |
| Q-21 | **Currency.** The docs write "$" and use `USD` in API examples. | `USD`, integer cents, currency code on every amount. | TBD | proposed | M1 | – |

## Fictional utility (Roadmap M0 "what you decide")

| ID | Question / gap | Proposal | Owner | Status | Blocks | Settled by |
|---|---|---|---|---|---|---|
| Q-01a | Utility name | "Riverbend Water District" (fictional) | TBD | proposed | M1 seed | – |
| Q-01b | Zones | Three zones, matching the M1 seed: `001` North, `002` Central, `003` South | TBD | proposed | M1 seed | – |
| Q-01c | Billing cycle | Monthly, by calendar month. Each zone has its own reading window (e.g. days 20–27), bill date (last day) and due date. | TBD | proposed | M4 | – |
| Q-01d | Account number format | `{CLS}-{ZONE}-{SEQ4}`, e.g. `RES-001-0042`. CLS is `RES`, `COM`, `IND` or `GOV`. The number is fixed when the account opens and never changes, even if the classification does. | TBD | proposed | M1 | – |
| Q-01e | Bill number format | `BILL-{YYYYMM}-{ZONE}-{SEQ6}`, e.g. `BILL-202610-001-000123`. Unique and never reused. | TBD | proposed | M5 | ADR-0008/M5 |
| Q-01f | Due date | Bill date + 15 days | TBD | proposed | M5 | – |
| Q-01g | Grace period | 3 days after the due date (the penalty rule) | – | decided (given) | – | Roadmap §3.3 |

## Billing rules

| ID | Question / gap | Proposal | Owner | Status | Blocks | Settled by |
|---|---|---|---|---|---|---|
| Q-03 | **Maintenance fee** is given only for a ½" meter ($15.00). | Keep fees per meter size as tariff data. Placeholder values until confirmed: ½" 15.00 · ¾" 25.00 · 1" 40.00 · 2" 100.00. | TBD | open | M5 | – |
| Q-04 | **Tariffs.** Commercial and Industrial are left to M5 (+40% and +80% suggested). **Government has no tariff at all.** | Commercial = Residential rates ×1.4, Industrial ×1.8 (as suggested). Government: *no default*, needs a decision. | TBD | open | M5 | – |
| Q-05 / A-07 | **Penalty timing.** The rule says "applied once, 3 days after the due date", but the worked example shows the penalty *on the next bill*. | Both hold. A daily billing job posts **one** penalty ledger entry per overdue bill (10% of its unpaid amount) 3 days after its due date and publishes `billing.bill.overdue`. The next bill **displays** arrears and penalty as separate lines from the ledger. See [edge-cases.md](edge-cases.md) §B. | TBD | proposed | M5 | – |
| Q-20 | **Penalty base.** Does "10% of the overdue amount" include earlier penalties? | No compounding: the base is the bill's unpaid charges, excluding penalties. One penalty per bill, ever. | TBD | proposed | M5 | – |
| Q-22 | **Rounding.** Per line or on totals? | Integer cents. Each percentage line (environmental fee, VAT, penalty) is rounded **half-up** to the cent on its own. This reproduces all three mandatory totals; see `evidence/m0-domain/billing-check.mjs`. | TBD | proposed | M5 | ADR-0008 |
| Q-19 | **Partial payments.** Is a payment credited to a bill or to the account? | Credited to the **account ledger** (`billId` optional, per Appendix C). A bill's "paid" status is derived oldest-first. | TBD | proposed | M7 | – |

## Reading rules

| ID | Question / gap | Proposal | Owner | Status | Blocks | Settled by |
|---|---|---|---|---|---|---|
| Q-06 | **R6 estimate when fewer than 3 periods of history exist** (new account, or just after a replacement). | Use the average of the periods that do exist. With no history, use a per-classification default (Residential 15 m³) and flag the reading for review. | TBD | open | M4 | – |
| Q-07 | **R2 when the 3-period average is 0** (division by zero; any usage is "infinite %"). | When the average is 0, flag `HIGH_USAGE` if consumption > 10 m³. Skip R2 when fewer than 3 periods exist. | TBD | open | M4 | – |
| Q-13 | **Rollover vs. misread.** Both show current < previous. | Treat it as rollover only when the previous reading is in the top 10% of the register range **and** the rollover consumption is within the R2 limit. Otherwise flag `NEGATIVE`. | TBD | open | M4 | – |
| Q-16 | After a replacement, do R2, R3 and R6 averages follow the **account** or the **meter**? | The account, so history continues across a replacement. | TBD | proposed | M4 | – |
| Q-22b | **Correcting an estimate.** How does the next real reading correct an estimated one? | Consumption is always measured from the last reading of any kind, estimated included, so over- or under-estimates even out in the next period. | TBD | proposed | M4 | – |

## Boundaries and data ownership

| ID | Question / gap | Proposal | Owner | Status | Blocks | Settled by |
|---|---|---|---|---|---|---|
| Q-08 | **Routes vs. route assignments.** The ownership matrix gives routes to Customer and route assignments to Reading, but the DB inventory puts `route_assignments` in `customer_db` too. | Customer owns zones and routes. Reading owns route assignments (`reading_assignments`). Drop `route_assignments` from `customer_db`. | TBD | proposed | M1 | architecture.md D-1 |
| Q-09 | **Dev Plan DB defects.** `payment_db` is listed twice and there are no `notification_db` tables. The DB inventory has no inbox tables, although inboxes are required. | `notification_db`: `notification_preferences`, `notification_templates`, `deliveries`, `inbox_events`. Add `inbox_events` (consumer + eventId unique) to every consuming service's database. | TBD | proposed | M7 | – |
| Q-12 | **Who may close a billing period?** It is not in the permission matrix. | Admin and Billing officer, because closing is part of "run billing". Only Admin may force-close over unresolved flags. | TBD | proposed | M4 | – |
| Q-14 | **Out-of-order events (M7).** A reading for a new meter can arrive before `customer.meter.replaced` has been processed. | Accept the reading as `SUBMITTED` and hold validation until the meter is known. | TBD | proposed | M7 | – |
| Q-15 | **Maintenance fee across a mid-period meter change** of a different size. | Charge for the meter installed at the end of the period. | TBD | proposed | M5 | – |
| D-4 | **Where does the customer-account link live?** | In Auth (`customer_account_links`), verified with Customer at registration. | TBD | proposed | M2 | ADR-0005 |

## Payments

| ID | Question / gap | Proposal | Owner | Status | Blocks | Settled by |
|---|---|---|---|---|---|---|
| Q-17 | **Two checkouts with different keys for the same bill** (client bug) could charge twice. | Allow only one `PENDING` checkout per bill. The UI creates the Idempotency-Key once per payment intent. | TBD | proposed | M7 | – |
| Q-18 | **Large accidental overpayments.** Should staff be alerted? | Send a staff notice when a payment leaves a credit balance above a threshold (value to be decided). Refunds wait for the M7 stretch goal (refund saga). | TBD | open | M7 | – |

---

*Seeded on 2026-10-27 from the 11 gaps found in the source PDFs (card DOM-008), plus the questions raised while drafting the glossary, user stories, context map, billing check and edge cases.*

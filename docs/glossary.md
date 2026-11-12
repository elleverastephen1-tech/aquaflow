# Glossary

The project's shared vocabulary (ubiquitous language). User stories, the context map, API names, event names and code must use these words with these meanings. If a word is missing or ambiguous, add it here before using it anywhere else.

Source: Learning Roadmap §3.1 (core concepts), §3.5 (validation rules), M4/M5 rules and Appendix A. The definitions are rewritten for this project.

**Owner** is the service that is the single source of truth for the term (see [architecture.md](architecture.md)).

## 1. Core domain terms (Roadmap §3.1)

| Term | Definition | Owner |
|---|---|---|
| **Customer** | The person or organisation legally responsible for paying. A customer can hold several service accounts (for example, a landlord with three houses). A customer is *not* a login; logins are users (see §3). | Customer |
| **Service account** (account) | One billable water connection at one service address. It has an account number, a classification and a status. Bills, readings and the ledger all hang off the account, not the customer. | Customer |
| **Account number** | The human-readable identifier printed on bills, e.g. `RES-001-0042`. It is separate from the account's UUID. The format is a project decision (see [assumptions.md](assumptions.md) A-01). | Customer |
| **Account status** | The account lifecycle: `PENDING → ACTIVE → SUSPENDED` or `DISCONNECTED`. An account can go back to `ACTIVE` only from `SUSPENDED`. Only `ACTIVE` accounts are read and billed. | Customer |
| **Service address** | The physical location the account supplies. An address belongs to one zone and one route. | Customer |
| **Classification** | The tariff category of an account: **Residential**, **Commercial**, **Industrial** or **Government**. It decides which tariff prices the consumption. | Customer (attribute); Billing prices it |
| **Meter** | A physical device with a unique serial number, a size (e.g. ½") and a register that only counts up. A meter exists in inventory before it is installed and can be replaced. | Customer |
| **Register** | The meter's counter. It shows total volume (m³) since the meter was made. It only increases, apart from rollover. | Customer (max digits); Reading (values) |
| **Meter installation** | The record that a meter was on an account from a date (with an *initial reading*) until a date (with a *final reading*). Installation history answers "which meter was on this account on date X?". An account has at most **one active installation**. | Customer |
| **Meter replacement** | Closing the old installation with a final reading and opening a new one with an initial reading, as one operation. | Customer |
| **Zone** | A geographic group of accounts that share a billing calendar (reading window, bill date, due date). | Customer |
| **Route** | An ordered walk of about 100–300 meters inside a zone that one reader can cover in a day. | Customer |
| **Route assignment** | Which reader reads which route in which billing period. It is the source of truth for whether a reader may submit a reading. | Reading |
| **Billing period** | The window (normally one month) of consumption that one bill covers, per zone. It has a reading window, a bill date and a due date, and is `OPEN` or `CLOSED`. | Reading |
| **Reading window** | The dates inside a billing period when readings may be taken. A reading dated outside it is rejected (R4). | Reading |
| **Reading** | The register value of a meter on a date, plus who took it and how. | Reading |
| **Consumption** | Water used in a period, in whole m³: `current reading − previous reading`. With a meter replacement: `(old final − old previous) + (new current − new initial)`. | Reading |
| **Previous reading** | The last approved (or estimated) reading of the same meter. If there is none, the installation's initial reading. Consumption is measured from it. | Reading |
| **Estimated reading** | A reading the system creates when the meter could not be read (no-access code, or period closed while unread). Its consumption is the average of the last 3 periods. It is clearly marked `ESTIMATED` and corrected by the next real reading. | Reading |
| **Tariff** | The price schedule for one classification: minimum charge, block rates, fees and taxes. | Billing |
| **Tariff version** | An effective-dated, immutable snapshot of a tariff (e.g. Residential `2026-01`). Once an issued bill uses a version, it can never be edited, only superseded by a new version. | Billing |
| **Bill** | An immutable statement of charges for one account and one billing period, with a unique bill number and a due date. Mistakes are corrected by adjustments, never by editing. | Billing |
| **Ledger** | The append-only list of debits (bills, penalties, debit memos) and credits (payments, credit memos) for an account. **Balance = sum of ledger entries.** A balance is never stored as a free-floating number. | Billing |
| **Arrears** | Balance from earlier bills that was still unpaid when the new bill was produced. It is carried forward onto the new bill. | Billing |
| **Penalty** | A one-off surcharge of 10% of the overdue amount, applied once, 3 days after the due date. | Billing |
| **Rollover** | When a register passes its maximum (e.g. 99999 on a 5-digit meter) and restarts at 0. Consumption is then `(max + 1 − previous) + current`. | Reading (detects); Customer (max digits) |

## 2. Rule and process terms

| Term | Definition | Owner |
|---|---|---|
| **Minimum charge** | A flat amount ($250.00 Residential) that covers the first 10 m³. It is charged even if consumption is lower. | Billing |
| **Block (tier)** | A consumption band priced per m³ (11–20, 21–30, 31–40, 41+). Blocks are cumulative: each m³ is priced at the rate of the block it falls in. | Billing |
| **Basic charge** | Minimum charge plus all block charges. | Billing |
| **Environmental fee** | 10% of the basic charge. | Billing |
| **Meter maintenance fee** | A flat fee per bill that depends on meter size ($15.00 for a ½" meter). | Billing |
| **VAT** | 12% of (basic charge + fees), rounded half-up to the cent. | Billing |
| **Current charges** | Basic charge + fees + VAT for this period only. | Billing |
| **Total amount due** | Current charges + arrears + penalties. | Billing |
| **Due date** | The last day to pay a bill without becoming overdue. | Billing |
| **Grace period** | The days after the due date before a penalty applies (3 days). | Billing |
| **Overdue** | A bill whose amount is still unpaid after the due date plus the grace period. | Billing |
| **Bill run** | A batch that bills every eligible account in one zone and period. Its steps are **preview** (draft bills and exceptions), **review**, then **issue**. Running it twice never makes duplicate bills. | Billing |
| **Draft bill** | A bill produced by a bill-run preview. It is not yet issued, carries no bill number and makes no ledger entries. | Billing |
| **Adjustment** | A correction posted after issue: a **credit memo** (reduces the balance) or a **debit memo** (increases it). It has a reason code and an approver, and creates new ledger entries. | Billing |
| **Credit balance** | A negative balance, usually from an overpayment. It is kept and used against future bills, never lost. | Billing |
| **Payment** | Money received for an account, over the counter (OTC) or online. Its status is `PENDING`, `CONFIRMED`, `FAILED` (or `REFUNDED`). | Payment |
| **OTC payment** | A payment a billing officer records at the counter. | Payment |
| **Receipt** | A confirmation document for a confirmed payment. | Payment |
| **No-access code** | A code a reader records when the meter cannot be read: locked gate, dog, obstructed and so on. It triggers an estimated reading (R6). | Reading |
| **Reading states** | `SUBMITTED → VALIDATED` or `FLAGGED`. `FLAGGED → APPROVED` or `REJECTED` (a re-read is requested). `ESTIMATED` is set for system-generated readings. | Reading |
| **Flag** | The reason a reading needs human review: `NEGATIVE` (R1), `HIGH_USAGE` (R2) or `ZERO_USAGE` (R3). | Reading |
| **Review queue** | The list of flagged readings waiting for a billing officer or admin to approve, override (new value plus reason) or reject. | Reading |
| **Override** | A reviewer replacing a reading's value. It records actor, time, previous value, new value and reason. | Reading |
| **Period close** | Moving a billing period to `CLOSED`. It is blocked while flagged readings are unresolved, unless an override is explicitly recorded. Unread meters get estimated readings. | Reading |
| **Notification preference** | A customer's chosen channels (email, SMS) for each kind of message. | Notification |

## 3. Identity terms

| Term | Definition | Owner |
|---|---|---|
| **User** | A login identity. It is a *staff user* (Admin, Billing officer, Meter reader) or a *customer user*. | Auth |
| **Role** | One of **Admin**, **Billing officer**, **Meter reader**, **Customer**. Each maps to a set of permissions (Roadmap §3.2). | Auth |
| **Permission** | A named capability such as `accounts:write`. It is checked by the backend on every request. | Auth (defines); every service enforces |
| **Customer-account link** | Proof that a customer user may see a service account. It is created by self-registration with an account number plus a verification code. Where it lives is decided in ADR-0005. | Auth (proposed) |
| **Audit event** | A record of a sensitive action: who, what, when, from where. | Auth (security); each service (domain) |

## 4. Technical terms (Roadmap Appendix A, plus terms used in the Development Plan)

| Term | Definition |
|---|---|
| **ADR** | Architecture Decision Record: a short document capturing one decision, its context, the options considered and the consequences. Stored in `docs/adr/`. |
| **Bounded context** | A boundary inside which one model and its words have exactly one meaning. In AquaFlow each bounded context is one service. |
| **Ubiquitous language** | The shared vocabulary in this file, used by people and code alike. |
| **BFF** | Backend-for-Frontend: a server layer (Next.js route handlers) made for one UI. It calls backend services and holds the session cookie. |
| **API gateway** | The single public entry point. It handles routing, JWT pre-check, rate limiting, request IDs, CORS and timeouts. It contains no business logic. |
| **JWT / JWKS** | JSON Web Token (a signed access token) and JSON Web Key Set (the public endpoint listing the keys that verify JWT signatures). |
| **Idempotency** | Doing an operation several times has the same effect as doing it once. |
| **Idempotency-Key** | A client-generated header on retryable mutations. The same key with the same body returns the original response. The same key with a different body returns `422 IDEMPOTENCY_KEY_REUSED`. |
| **Domain event** | A past-tense fact one service publishes, e.g. `billing.bill.issued`. The format is `<context>.<entity>.<past-tense-verb>`. |
| **Event envelope** | The standard wrapper around every event: `id`, `type`, `version`, `occurredAt`, `source`, `correlationId`, `data`. |
| **Outbox pattern** | Writing the event to an `outbox_events` table in the same DB transaction as the business change, then relaying it to the broker. Without it, an event can be lost. |
| **Inbox (processed events)** | A consumer's record of event IDs it has handled, so that duplicates cause no second effect. |
| **At-least-once delivery** | The broker may deliver a message more than once. Consumers must be idempotent. |
| **Dead-letter queue (DLQ)** | Where messages go after repeated processing failures, to be inspected and replayed. |
| **Eventual consistency** | Data in different services agrees after a short delay rather than instantly. |
| **Read model** | A service's own local copy of another service's data, built from events (e.g. Billing's consumption read model). |
| **Circuit breaker** | Stops calling a failing dependency for a while so the failure does not spread. |
| **Liveness / readiness** | Liveness (`/healthz`) means the process is up. Readiness (`/readyz`) means it can serve traffic, for example because the DB is reachable. |
| **Minor units** | Money as an integer count of the smallest unit (cents). `$2,037.81` = `203781`. Floats are never used for money. |
| **Half-up rounding** | Round to the nearest cent, with exactly .5 rounding away from zero: 159.408 → 159.41, 0.125 → 0.13. |
| **GitOps** | The cluster's desired state lives in Git, and an agent (Argo CD) keeps applying it. |
| **SLI / SLO** | Service Level Indicator (a measurement) and Service Level Objective (the target for it). |
| **Trace / span** | A trace is one request's whole journey; spans are the timed steps inside it. |
| **IDOR** | Insecure Direct Object Reference: reading someone else's data by changing an ID in the URL. |

# User stories

Format: *As a … I want … so that …*, with 2–4 acceptance criteria each. Words in **bold** in the criteria are glossary terms ([glossary.md](glossary.md)).

Every story has been checked against the role/permission matrix (Roadmap §3.2, reproduced at the end). Each role has at least one **negative** criterion (marked ⛔) that the M2 permission-matrix tests must cover.

The **Milestone** column says where the story is first delivered. Backend first, UI later.

| ID | Role | Story | Milestone |
|---|---|---|---|
| US-ADM-01 | Admin | Manage staff users and roles | M2 (API), M6 (UI) |
| US-ADM-02 | Admin | Publish a new tariff version | M5, M6 |
| US-ADM-03 | Admin | Review the audit log | M2, M6 |
| US-ADM-04 | Admin | Close a billing period | M4, M6 |
| US-BO-01 | Billing officer | Open an account and install a meter | M1, M6 |
| US-BO-02 | Billing officer | Replace a meter | M1, M4 |
| US-BO-03 | Billing officer | Review flagged readings | M4, M6 |
| US-BO-04 | Billing officer | Run and issue bills for a zone | M5, M6 |
| US-BO-05 | Billing officer | Record an over-the-counter payment | M7 |
| US-BO-06 | Billing officer | Post an adjustment | M5 |
| US-MR-01 | Meter reader | See today's route | M4, M8 |
| US-MR-02 | Meter reader | Submit readings offline | M4, M8 |
| US-MR-03 | Meter reader | Record no access | M4, M8 |
| US-MR-04 | Meter reader | Be warned about suspicious readings | M4, M8 |
| US-CUS-01 | Customer | Register and link my account | M2, M8 |
| US-CUS-02 | Customer | View my bills and download PDFs | M5, M8 |
| US-CUS-03 | Customer | See my usage history | M8 |
| US-CUS-04 | Customer | Pay my bill online | M7, M8 |
| US-CUS-05 | Customer | Choose how I'm notified | M7, M8 |

---

## Admin

### US-ADM-01 Manage staff users and roles
**As an** admin **I want** to create staff users, assign them a role and deactivate them **so that** only current staff can use the system, with exactly the access their job needs.

- Given I create a user with the role Meter reader, when that user logs in, then they can reach only the reader functions.
- When I deactivate a user, their refresh token stops working at once, and their access token expires within its lifetime (ADR-0004 sets the lifetime).
- Every create, role change and deactivation is written to the **audit event** log with actor, target, time and before/after role.
- ⛔ A billing officer calling the staff-user endpoints gets `403`.

### US-ADM-02 Publish a new tariff version
**As an** admin **I want** to publish a new **tariff version** with an effective date **so that** price changes apply from the right period without changing bills already issued.

- A version applies only to **billing periods** that start on or after its effective date.
- A version that an **issued** bill has used cannot be edited. Trying returns `409` and points to "create a new version".
- Tariff amounts are stored as data in **minor units**, not in code.
- ⛔ A billing officer can view tariffs but gets `403` when creating or editing one.

### US-ADM-03 Review the audit log
**As an** admin **I want** to search the audit log by user, action and date **so that** I can investigate who did what to an account or bill.

- Logins, failed logins, role changes, reading overrides, adjustments, bill issues and OTC payments are all logged.
- Entries are append-only. No API updates or deletes them.
- No entry contains a password, token or payment secret.
- ⛔ A billing officer sees dashboards but gets `403` on the audit log.

### US-ADM-04 Close a billing period
**As an** admin (or billing officer) **I want** to close a zone's **billing period** **so that** consumption is final and the **bill run** can start.

- Closing is blocked while any reading in the period is still `FLAGGED`. The response lists the blocking readings.
- An admin can force-close with an explicit, recorded override reason.
- On close, every active account without a reading gets an **estimated reading**, and `reading.period.closed` is published.
- Closing an already-closed period is idempotent: it returns the same result and has no new effects.

## Billing officer

### US-BO-01 Open an account and install a meter
**As a** billing officer **I want** to open a **service account** for a customer and install a meter from inventory with its initial reading **so that** the connection can be read and billed.

- A new account starts `PENDING` and becomes `ACTIVE` only through the status endpoint, with a reason.
- Installing a meter on an account that already has an active meter returns `409 METER_ALREADY_INSTALLED` with a helpful message.
- A meter serial must be unique. Registering a duplicate returns `409`.
- Invalid input returns `400` with field-level details. An unknown customer returns `404`.

### US-BO-02 Replace a meter
**As a** billing officer **I want** to replace a broken meter, recording the old meter's final reading and the new meter's initial reading in one step **so that** the period's consumption is still correct and the history is kept.

- After replacement, the history shows which meter was on the account on any past date.
- Consumption for that period = (old final − old previous) + (new current − new initial). See [edge-cases.md](edge-cases.md) §A.
- The new meter's lower reading does **not** raise a `NEGATIVE` flag (R1).
- `customer.meter.replaced` is published with both meter IDs and both readings.

### US-BO-03 Review flagged readings
**As a** billing officer **I want** a queue of **flagged** readings showing the photo, the flag reason and the previous 6 readings **so that** I can approve, override or reject each one quickly and confidently.

- Approve moves the reading to `APPROVED`. Reject moves it to `REJECTED` and requests a re-read on the reader's route.
- An **override** needs a new value and a reason. Actor, time, old value and new value are recorded.
- The queue can be filtered by zone, route and flag type, and is paginated on the server.
- ⛔ A meter reader gets `403` on the review endpoints.

### US-BO-04 Run and issue bills for a zone
**As a** billing officer **I want** to preview a bill run for a closed period, review totals and exceptions, then issue it **so that** every account gets a correct bill exactly once.

- Preview shows the draft bills, the period total and any exceptions (e.g. an account with no consumption) without writing to the **ledger**.
- Issuing writes one bill per account and period with a unique bill number, and debits the ledger.
- Re-running issue, or retrying after a crash, creates **no duplicate** bills.
- The 37 m³ example bill shows exactly **$2,037.81**, with the lines in [evidence/m0-domain/billing-spreadsheet.csv](evidence/m0-domain/billing-spreadsheet.csv).

### US-BO-05 Record an over-the-counter payment
**As a** billing officer **I want** to record a cash or cheque payment at the counter and print a receipt **so that** the customer's balance updates immediately.

- The payment is credited to the account's ledger exactly once, even if I press Save twice (Idempotency-Key).
- A payment larger than the balance leaves a **credit balance**. It is never lost or refused.
- A receipt with a unique number is produced.
- ⛔ A meter reader or customer gets `403` on this endpoint.

### US-BO-06 Post an adjustment
**As a** billing officer **I want** to post a credit or debit memo against an issued bill with a reason code **so that** mistakes are corrected without editing the bill.

- The original bill is unchanged. The adjustment adds a new ledger entry.
- A reason code and approver are required. Missing either returns `400`.
- `billing.adjustment.posted` is published and the customer is notified.
- ⛔ Any attempt to `UPDATE` an issued bill's lines or total is rejected (`409`).

## Meter reader

### US-MR-01 See today's route
**As a** meter reader **I want** to see my assigned route for today in walking order, with each stop's address, meter serial and previous reading **so that** I can work through it without paperwork.

- I see only routes assigned to me for the open period.
- I can search stops by meter serial or address.
- The route stays available offline once loaded (M8).
- ⛔ Asking for another reader's route returns `403` or `404` and never the data.

### US-MR-02 Submit readings offline
**As a** meter reader **I want** to enter readings and photos with no signal and have them sync later **so that** a dead zone doesn't stop my route.

- Readings queue on the device and show pending, synced or failed per stop.
- Sync uses the batch endpoint with an Idempotency-Key. Sending the same batch twice creates no duplicates, and the second response equals the first (R5).
- A reading dated outside the period's **reading window** is rejected with a clear error (R4).
- ⛔ A reading for a meter on a route not assigned to me is rejected.

### US-MR-03 Record no access
**As a** meter reader **I want** to record a no-access code (locked gate, dog, obstructed) instead of a value **so that** the customer still gets a fair bill.

- The system creates an `ESTIMATED` reading from the 3-period average (R6).
- The estimated reading is clearly marked on the bill and corrected by the next real reading.
- The no-access code and its time are kept for audit.

### US-MR-04 Be warned about suspicious readings
**As a** meter reader **I want** a warning while I type if the value looks wrong, and a prompt to take a photo **so that** I can double-check before leaving the property.

- A value lower than the previous reading warns me about `NEGATIVE` (R1).
- A consumption over 300% of the 3-period average warns me about `HIGH_USAGE` (R2).
- If the reading would be flagged and I have no photo, I am warned before submitting (R7).
- The warning does not block submission. The server is the source of truth for flags.

## Customer

### US-CUS-01 Register and link my account
**As a** customer **I want** to register online using my account number and the verification code on my bill **so that** I can manage my account without visiting the office.

- Registration succeeds only if the account number and code match (verified with the Customer Service).
- A wrong code returns a generic error that does not reveal whether the account exists. Repeated failures are rate-limited.
- My password is hashed (Argon2id), never logged and never returned by any API.
- `auth.user.registered` is published.

### US-CUS-02 View my bills and download PDFs
**As a** customer **I want** to see my current bill, amount due, due date and bill history, and download each bill as a PDF **so that** I know what I owe and why.

- The bill shows readings, consumption, every line item, arrears, penalty and total, matching the issued bill exactly.
- The PDF is the stored, immutable document for that bill.
- ⛔ Changing the account or bill ID in the URL to someone else's returns `403` or `404` and never their data.

### US-CUS-03 See my usage history
**As a** customer **I want** a 12-month chart of my consumption **so that** I can spot leaks and manage my use.

- Estimated periods are visibly marked as estimated.
- The chart is readable on a 360 px wide phone.
- Only my own accounts are available.

### US-CUS-04 Pay my bill online
**As a** customer **I want** to pay online and see the payment go from pending to confirmed **so that** I know my bill is settled.

- After checkout the payment shows `PENDING`. It changes to `CONFIRMED` without a manual refresh once the provider's webhook arrives.
- Paying twice by double-clicking charges once (Idempotency-Key). A duplicated webhook credits once. See [edge-cases.md](edge-cases.md) §B.
- A failed payment shows `FAILED` with a reason, and the balance is unchanged.
- ⛔ Paying a bill on an account I am not linked to returns `403` or `404`.

### US-CUS-05 Choose how I'm notified
**As a** customer **I want** to choose email and/or SMS for bill issued, payment received and overdue reminders **so that** I get the messages I need in the way I prefer.

- Preferences are saved per message type and channel.
- Opting out of email for "bill issued" means no bill email is sent for my next bill.
- Delivery attempts are logged with their status.

---

## Permission cross-check (Roadmap §3.2)

| Capability | Admin | Billing officer | Meter reader | Customer | Stories |
|---|---|---|---|---|---|
| Manage staff users & roles | ✅ | – | – | – | ADM-01 |
| Create / edit customers, accounts, meters | ✅ | ✅ | – | – | BO-01, BO-02 |
| View accounts & meters | ✅ | ✅ | own route | own only | MR-01, CUS-02 |
| Submit meter readings | ✅ | – | own route | stretch: self-read | MR-02, MR-03 |
| Review / approve flagged readings | ✅ | ✅ | – | – | BO-03 |
| Manage tariffs | ✅ | – | – | – | ADM-02 |
| Run billing, issue bills, adjustments | ✅ | ✅ | – | – | BO-04, BO-06, ADM-04* |
| View bills & ledger | ✅ | ✅ | – | own only | CUS-02 |
| Record OTC payments | ✅ | ✅ | – | – | BO-05 |
| Pay online | – | – | – | own only | CUS-04 |
| View audit log & dashboards | ✅ | dashboards only | – | – | ADM-03 |

\* Who may close a billing period is not in the matrix. The proposal is Admin and Billing officer, because closing is part of running billing. Logged as Q-12 in [assumptions.md](assumptions.md).

No story gives a role a capability the matrix does not allow.

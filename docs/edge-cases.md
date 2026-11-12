# Edge-case walkthroughs

M0 task: walk through the two edge cases that most often break naive designs, using real numbers, and name the service and event for every step. The open points found here are copied into [assumptions.md](assumptions.md).

The account throughout is `RES-001-0042` (Residential, zone 001), the account from the worked billing example.

---

## A. Meter replaced mid-period

### Given
- October period. The previous approved reading on old meter **SN 8812345** (5-digit register, max 99999) is **1,245**.
- On 12 Oct the meter breaks and a billing officer replaces it. The old meter's **final reading is 1,262**. New meter **SN 9900001** is installed with **initial reading 0**.
- At the end of the reading window the reader reads the new meter at **20**.
- Formula (given, M4): `consumption = (old final − old previous) + (new current − new initial)`.

### Step by step

| # | What happens | Service | Data / event |
|---|---|---|---|
| 1 | Officer calls `POST /accounts/{id}/meter/replace` with old final 1,262 and new serial plus initial 0 | **Customer** | Closes installation #1 (to 12 Oct, final 1,262) and opens installation #2 (from 12 Oct, initial 0) in one transaction |
| 2 | Customer publishes the replacement | **Customer** (outbox) | `customer.meter.replaced {accountId, oldMeterId, finalReading: 1262, newMeterId, initialReading: 0}` |
| 3 | Reading records two **installation segments** for the account in this period | **Reading** | Segment 1: SN 8812345, 1,245 → 1,262. Segment 2: SN 9900001, 0 → (open) |
| 4 | Reader submits 20 for SN 9900001 | **Reading** | R1 compares 20 with the **new meter's own previous** (its initial 0): no `NEGATIVE` flag |
| 5 | Consumption is computed | **Reading** | (1,262 − 1,245) + (20 − 0) = 17 + 20 = **37 m³** |
| 6 | Reading is approved and published | **Reading** | `reading.reading.approved {accountId, periodId, consumption: 37, …}` |
| 7 | Bill run prices 37 m³ | **Billing** | Current charges **$1,487.81**, the same as worked example case A |

### What must not happen
- **R1 must not fire.** A naive check, `20 − 1,245 = −1,225`, would flag `NEGATIVE`. The rule must compare readings **of the same meter**, and treat a replacement inside the period as an explanation.
- Billing must not compute consumption itself. It receives 37 from Reading.
- Customer must not edit or delete installation #1. History is append-only, so "which meter was on the account on 5 Oct?" still answers SN 8812345.

### Rollover variant
The old meter rolled over before it was replaced: previous reading **99,985**, final reading at replacement **2**.

| Segment | Calculation | m³ |
|---|---|---|
| Old meter (rolled over) | (99,999 + 1 − 99,985) + 2 | 17 |
| New meter | 20 − 0 | 20 |
| **Total** | | **37** |

- R1 sees final 2 < previous 99,985. **Rollover** explains it only if the meter's max digits are known (Customer holds `maxDigits` and sends it to Reading) **and** the resulting consumption is plausible.
- A genuine misread (the reader typed 2 instead of 99,992) looks exactly the same. **Proposed rule:** treat it as rollover only when the previous reading is in the top 10% of the register range **and** the rollover consumption does not exceed the R2 limit. Otherwise flag `NEGATIVE` for review. → **Q-13**

### Open points (copied to assumptions)
- **Q-14** In M7 the reading for SN 9900001 can arrive before `customer.meter.replaced` is processed (out-of-order delivery). Proposal: Reading accepts the reading but keeps it `SUBMITTED` (not validated) until the meter is known, then validates it.
- **Q-15** If the old and new meters are different sizes, which maintenance fee applies? Proposal: the size of the meter installed at the end of the period.
- **Q-16** Should the 3-period averages used by R2 and R6 follow the **account** or the **meter**? Proposal: the account, so history continues across a replacement.

---

## B. Customer pays twice by mistake

### Starting ledger for `RES-001-0042` (Billing owns it)

| Date | Entry | Debit | Credit | Balance |
|---|---|---:|---:|---:|
| 30 Sep | Bill Sep (issued, unpaid) | 500.00 | | 500.00 |
| 18 Oct | Penalty: 10% of 500.00, 3 days after the 15 Oct due date | 50.00 | | 550.00 |
| 31 Oct | Bill Oct `BILL-202610-001-000123`, current charges | 1,487.81 | | **2,037.81** |

The October bill shows arrears 500.00 + penalty 50.00 + current 1,487.81 = **2,037.81** due. Only the current charges are a *new* ledger debit. The arrears and penalty are already in the ledger, so nothing is counted twice.

### B1. The same payment arrives twice (retry or duplicate)
The customer double-clicks **Pay**, the provider sends its webhook twice, and RabbitMQ redelivers the event. All of these are **one** payment.

| # | Duplicate | Where it is stopped | Mechanism |
|---|---|---|---|
| 1 | Two `POST /payments/checkout` with the **same `Idempotency-Key`** | **Payment** | `idempotency_keys` (key + request fingerprint) returns the original response. A different body with the same key returns `422 IDEMPOTENCY_KEY_REUSED` |
| 2 | Provider webhook `evt_7731` delivered twice | **Payment** | `provider_webhooks` is unique on the provider event ID. The second delivery is acknowledged `200` and ignored |
| 3 | `payment.payment.received` (event id `e-5f2…`) delivered twice by the broker | **Billing**, **Notification** | Each consumer's **inbox** (consumer + eventId, unique) is written in the same transaction as the side effect. The second delivery is a no-op |

Result:

| Date | Entry | Debit | Credit | Balance |
|---|---|---:|---:|---:|
| 10 Nov | Payment PAY-…-0091 (online) | | 2,037.81 | **0.00** |

**Exactly once:** one payment row, one ledger credit, one receipt, one "payment received" email.

### B2. A genuine second payment
The customer pays online on 10 Nov **and** pays the same amount at the counter on 12 Nov. These are two real payments with different idempotency keys and different provider references, so the system must accept both and **lose nothing**.

| Date | Entry | Debit | Credit | Balance |
|---|---|---:|---:|---:|
| 10 Nov | Payment PAY-…-0091 (online) | | 2,037.81 | 0.00 |
| 12 Nov | Payment PAY-…-0094 (OTC) | | 2,037.81 | **−2,037.81** (credit) |
| 30 Nov | Bill Nov, current charges (example) | 1,487.81 | | −550.00 (credit) |

- The overpayment becomes a **credit balance** (given rule). The November bill shows 0.00 due, with a 550.00 credit carried forward.
- Two receipts and two notifications are correct here, because there were two payments.
- Refunding the credit is out of scope until the M7 stretch goal (refund saga). Staff can see the credit balance on the account.

### Open points (copied to assumptions)
- **Q-17** If the browser creates two checkouts with *different* keys for the same bill (a client bug), the provider could charge twice. Proposal: Payment allows only **one `PENDING` checkout per bill**, and the UI generates the key once per payment intent.
- **Q-18** Should staff be alerted when a payment creates a credit balance larger than X (a likely mistaken double payment)? Proposal: a `payment.payment.received` consumer in Notification sends a staff notice. The threshold is to be decided.
- **Q-19** Partial payments: is a payment credited against a specific bill or against the account? Proposal: against the **account ledger** (`billId` optional, per Appendix C), with a bill's "paid" status derived oldest-first.

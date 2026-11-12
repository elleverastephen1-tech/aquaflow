# Event catalog

> **Status:** starter catalog from Roadmap Appendix C and the Dev Plan's event examples. Events are published from M7 on. From M7 the typed schemas live in `packages/contracts` (Zod), and this file must agree with them. Renaming an event or field is a contract change and needs an ADR (ADR-0012).

## Naming
`<context>.<entity>.<past-tense-verb>`. Events are facts that already happened. Payloads carry IDs and the facts consumers need, never whole database rows.

## Envelope (given)

```json
{
  "id": "0b8f7c7e-…-uuid",
  "type": "billing.bill.issued",
  "version": 1,
  "occurredAt": "2026-10-05T08:30:00Z",
  "source": "billing-service",
  "correlationId": "req-7f3a…",
  "data": { "billId": "…", "accountId": "…", "amountDue": 203781, "dueDate": "2026-10-20" }
}
```

- `id`: unique. Consumers de-duplicate on it (inbox).
- `version`: schema version of `data`.
- Money is in integer minor units. Dates without a time are `YYYY-MM-DD`.

## Events

| Event type | Producer | Consumers | Key data |
|---|---|---|---|
| `customer.account.opened` | Customer | Reading, Billing | accountId, accountNo, classification, zoneId |
| `customer.account.status-changed` | Customer | Reading, Billing, Notification | accountId, from, to, reason |
| `customer.meter.installed` | Customer | Reading | accountId, meterId, serial, maxDigits\*, initialReading, date |
| `customer.meter.replaced` | Customer | Reading, Billing | accountId, oldMeterId, finalReading, newMeterId, initialReading, date\* |
| `reading.reading.submitted`† | Reading | – | readingId, accountId, meterId, periodId |
| `reading.reading.validated`† | Reading | – | readingId, accountId |
| `reading.reading.flagged` | Reading | Notification (staff) | readingId, accountId, flags[] |
| `reading.reading.approved` | Reading | Billing | readingId, accountId, periodId, value, consumption, estimated |
| `reading.reading.rejected`† | Reading | Notification (staff) | readingId, accountId, reason |
| `reading.period.closed` | Reading | Billing | periodId, zoneId, accountCount |
| `billing.bill.issued` | Billing | Notification, Payment | billId, billNo, accountId, amountDue, dueDate, pdfKey |
| `billing.bill.overdue` | Billing | Notification | billId, accountId, overdueAmount, penalty |
| `billing.adjustment.posted` | Billing | Notification | adjustmentId, accountId, amount, reason |
| `payment.payment.received` | Payment | Billing, Notification | paymentId, accountId, billId?, amount, method, receivedAt |
| `payment.payment.failed` | Payment | Notification | paymentId, accountId, reason |
| `auth.user.registered` | Auth | Customer, Notification | userId, role, accountNo? |
| `notification.notification.sent`† | Notification | – | deliveryId, eventId, channel |

\* Field added in M0 and not in Appendix C. Reading needs `maxDigits` for rollover detection and `date` to split installation segments ([edge-cases.md](edge-cases.md) §A).
† Listed in the Dev Plan's naming examples but not in Appendix C. Publishing it is optional until a consumer needs it.

## Reliability rules
- Publish only through the **transactional outbox** (the business change and the event row in one transaction, then a relay).
- Consumers acknowledge only after successful processing, and record `eventId` in their **inbox** in the same transaction as the side effect.
- Duplicates never cause a second ledger entry, notification or payment.
- Retries use exponential backoff. Poison messages go to the DLQ after N attempts, and DLQ replay keeps idempotency.
- `correlationId` and the trace context are propagated in message headers.

# Life of a bill: 2-minute practice script

A rehearsal aid built from [architecture.md §6](../../architecture.md#6-the-life-of-a-bill-roadmap-24). Learn the shape, then say it in your own words without this page. About 280 words, which is roughly 2 minutes at a normal pace.

1. **Setup (Customer).** A customer has a service account with a classification and a meter on a route in a zone. Customer owns all of that master data.
2. **Read (Reading).** A reader walks an assigned route and submits a meter reading with a photo. Reading owns the previous reading, so it computes consumption, including rollover.
3. **Validate (Reading).** Rules R1 to R7 flag anomalies such as negative or very high usage. Flagged readings wait for review. When the account has no reading, R6 estimates one.
4. **Approve (Reading).** An officer approves or corrects flagged reads. When the period closes, Reading publishes `reading.reading.approved` and `reading.period.closed`.
5. **Bill run (Billing).** Billing applies the versioned tariff to consumption: minimum charge, blocks, environmental fee, maintenance fee, VAT. Arrears and the penalty come from the ledger. Money is integer cents.
6. **Issue (Billing).** The bill becomes immutable, the PDF is stored and the ledger is debited. Billing publishes `billing.bill.issued`.
7. **Notify (Notification).** Notification sends an email or SMS. Payment prepares to accept payment for that bill.
8. **Pay (Payment).** The customer pays through a checkout. The provider webhook is verified and deduplicated, and Payment publishes `payment.payment.received`.
9. **Close the loop (Billing).** Billing credits the ledger idempotently and the balance clears. If unpaid 3 days after the due date, a job posts one 10% penalty, which shows on the next bill.

Anchor numbers: Case B, 6 m³ gives 324.80. Case A, 37 m³ with 500.00 arrears gives 2037.81.

Note: until M7, steps 5 onward use HTTP calls and polling, not events.

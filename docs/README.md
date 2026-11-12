# AquaFlow documentation

| Path | Purpose | Since |
|---|---|---|
| [glossary.md](glossary.md) | Domain and technical vocabulary (ubiquitous language) | M0 |
| [user-stories.md](user-stories.md) | User stories with acceptance criteria and a permission cross-check | M0 |
| [architecture.md](architecture.md) | Context map, service ownership, sync/async boundaries | M0 (updated each milestone) |
| [diagrams/](diagrams/) | Diagram sources (`context-map.mmd`) | M0 |
| [edge-cases.md](edge-cases.md) | Meter replacement and duplicate-payment walkthroughs | M0 |
| [assumptions.md](assumptions.md) | Assumptions and open questions, with owner and status | M0 (living) |
| [event-catalog.md](event-catalog.md) | Event names, producers, consumers, payloads | M0 starter, M7 final |
| [adr/](adr/README.md) | Architecture Decision Records and their index | M0 |
| [journal.md](journal.md) | Development journal, 3–5 lines per session | M0 (living) |
| [api/](api/) | Generated or manual API docs | M1 |
| [runbooks/](runbooks/) | Operational procedures | M3+ |
| [evidence/](evidence/) | Proof of completed work per milestone (`m0-domain` … `m12-capstone`) | M0 |
| [reference/](reference/) | Source documents: Learning Roadmap v1.0 and Development Plan (PDF) | M0 |

Files to add in later milestones (Dev Plan › Required repository documentation): `slo.md` (M11), `security-review.md`, `load-test-results.md` and `retrospective.md` (M12).

## M0 evidence

| Deliverable | Location |
|---|---|
| Billing hand-calculation (3 mandatory totals) | [evidence/m0-domain/billing-spreadsheet.csv](evidence/m0-domain/billing-spreadsheet.csv), regenerated and checked by `node docs/evidence/m0-domain/billing-check.mjs` |
| Context map | [architecture.md §1](architecture.md#1-context-map) (Mermaid), also on the Asgard project canvas |
| Checkpoint A notes | `evidence/m0-domain/checkpoint-a.md` (added at the review) |

**Never** put secrets, real customer data, payment credentials or private keys in `evidence/`.

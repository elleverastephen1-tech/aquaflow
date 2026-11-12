# AquaFlow

Water meter reading and billing system for a fictional municipal water utility.

AquaFlow lets a water utility manage its customers and meters, collect monthly meter readings in the field (even without mobile signal), turn readings into accurate and auditable bills using tiered tariffs, collect payments and keep customers informed. Staff use a web portal, meter readers use a mobile-friendly offline app, and customers use a self-service portal.

It is built as a guided learning project: 13 milestones (M0–M12) over about 29 weeks, ending with a system of independent Node.js services, a Next.js web app, RabbitMQ, Docker Compose, Kubernetes, CI/CD and full observability.

## Status

| Milestone | State |
|---|---|
| **M0 — Orientation & domain discovery** | **In progress.** Domain documents drafted and waiting for review at Checkpoint A. |
| M1 — Monorepo & Customer Service | Not started. Blocked by Checkpoint A. |
| M2–M12 | Not started |

There is no application code yet. M0 is deliberately documents only: *"Most failed microservice projects fail at the whiteboard, not in the code."*

## Documentation

| Document | What it holds |
|---|---|
| [docs/README.md](docs/README.md) | Index of every project document |
| [docs/glossary.md](docs/glossary.md) | Ubiquitous language: domain and technical terms |
| [docs/user-stories.md](docs/user-stories.md) | User stories for the four roles, with acceptance criteria |
| [docs/architecture.md](docs/architecture.md) | Context map, service ownership, sync/async boundaries |
| [docs/edge-cases.md](docs/edge-cases.md) | Meter replacement and duplicate payment walkthroughs |
| [docs/assumptions.md](docs/assumptions.md) | Assumptions and open questions, with owners and status |
| [docs/event-catalog.md](docs/event-catalog.md) | Domain events (starter catalog) |
| [docs/adr/](docs/adr/README.md) | Architecture Decision Records |
| [docs/journal.md](docs/journal.md) | Development journal |
| [docs/reference/](docs/reference/) | Source documents: Learning Roadmap and Development Plan (PDF) |

## Target architecture

```
Browser ─▶ Next.js web (staff portal · reader PWA · customer portal, BFF)
              │
              ▼
          API Gateway (routing · JWT pre-check · rate limit · request IDs)
              │
   ┌──────────┼──────────┬──────────┬──────────┬──────────────┐
   ▼          ▼          ▼          ▼          ▼              ▼
  Auth     Customer    Reading    Billing    Payment     Notification
 auth_db  customer_db reading_db billing_db payment_db  notification_db
   └──────────┴─────── RabbitMQ (domain events, outbox/inbox) ┘
Redis · MinIO (PDFs, photos) · Mailpit · OTel/Prometheus/Grafana/Loki/Tempo
```

Each service owns its database. No service reads another service's tables. See [docs/architecture.md](docs/architecture.md).

## Repository layout

```
apps/web/                 Next.js app (M6+)
services/<name>/          gateway, auth, customer, reading, billing, payment, notification (M1+)
packages/                 shared-config, logger, auth-middleware, contracts (tooling and contracts only)
infra/                    compose, k8s, terraform, observability (M1+)
docs/                     everything written so far
tests/e2e/                end-to-end tests (M6+)
```

Folders are created in the milestone that first needs them, so the tree stays honest about what exists.

## How to run locally

Nothing to run yet. M1 adds the Customer Service and this section, which should need four commands at most.

## Working agreements

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: a branch and a pull request per task, Conventional Commits, an ADR for any decision that is expensive to reverse, a journal entry per working session, and never commit secrets.

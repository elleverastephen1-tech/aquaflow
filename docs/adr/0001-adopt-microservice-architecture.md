# ADR-0001: Adopt a microservice architecture

Status:   Proposed (to be reviewed at Checkpoint A, then set to Accepted)
Date:     2026-10-27
Deciders: AquaFlow team, reviewed by <mentor, see assumptions Q-11>
Card:     DOM-007

## Context
AquaFlow has to manage customers and meters, collect field readings (including offline), validate them, produce auditable bills with versioned tariffs, take payments and notify customers.

AquaFlow is also a **learning project**. Its stated outcome is skill with independently deployable Node.js services, messaging, containers, Kubernetes, CI/CD and observability. The capstone criteria require *"six backend services plus the gateway, each with its own database, independently buildable and deployable"* and *"no service reads another service's database"*.

Forces:
- The domain splits cleanly along business capabilities: identity, customer and meter master data, field reading, billing, payments, notifications. Each has its own vocabulary ([glossary.md](../glossary.md)) and its own rate of change. Tariffs change yearly, reading rules rarely, payment providers whenever the business changes contracts.
- Different parts have different runtime profiles. Reading sync is bursty, on mornings and at the end of the window. Bill runs are batch. Payments are latency-sensitive and must be exactly-once in effect.
- The team is learning. Complexity has to be paid for in time, and the schedule is about 29 part-time weeks.
- Real load is modest. Design for clarity, not for millions of users.

## Options considered
1. **Single monolith with a single database.** It is the simplest to build, run and debug. It does not meet the capstone criteria or the learning goals. Boundaries tend to erode over time because nothing enforces them.
2. **Modular monolith.** One deployable unit with strictly separated modules, each with its own schema, talking only through in-process interfaces and in-process events. It gets most of the boundary discipline with far less operational cost. It is the honest default for a team and load of this size. It does not teach or demonstrate network failure modes, independent deploys, a broker, the outbox/inbox patterns or Kubernetes operations, and it fails the capstone criteria as written.
3. **Microservices, one per bounded context.** Six services (Auth, Customer, Reading, Billing, Payment, Notification) plus a gateway and a Next.js BFF. Each has its own PostgreSQL database. They integrate through HTTP and RabbitMQ domain events with an outbox and inbox.
4. **Finer-grained services** (e.g. separate Tariff, Ledger, Meter, Route services). Rejected early. These are "nano-services" (Roadmap M0 pitfall), and they multiply network calls and distributed transactions with no matching benefit.

## Decision
We choose **option 3: microservices, one per bounded context**, following the boundaries in [architecture.md](../architecture.md). Each service owns its data, and no service reads another's tables. Shared packages contain tooling and contracts only.

We choose it because the project's purpose and acceptance criteria demand it, and because the domain has natural seams that keep cross-service chatter low. We take on the costs below **knowingly**. For a production utility of this size we would probably start with option 2.

## Consequences
- ✅ Each bounded context has a hard boundary (process and database), so coupling is visible and has to be deliberate.
- ✅ Services can be built, tested, deployed and scaled on their own. Reading and the gateway can scale (HPA) without scaling Billing.
- ✅ A failure in one area, such as notifications, need not stop readings or payments.
- ✅ It teaches the target skills: messaging, the outbox and inbox, idempotency, containers, Kubernetes, distributed tracing.

- ⚠️ **No cross-service transactions.** "Issue bill and notify" and "record payment and credit ledger" become eventually consistent and need the outbox, inbox, retries and DLQs. That is much more code than a single `BEGIN … COMMIT`.
- ⚠️ **Eventual consistency becomes visible to users.** A payment can show *pending* before the ledger is credited, and the UI has to explain that.
- ⚠️ **More failure modes.** There are network timeouts, partial outages, duplicate and out-of-order messages, and version skew between services. Each needs handling and tests.
- ⚠️ **Operational overhead.** There are seven databases, a broker, a gateway, seven Dockerfiles and Helm releases, and centralized logs, metrics and traces. These are needed just to see what is going on.
- ⚠️ **Harder local development and debugging.** Running the whole stack needs Docker Compose, and debugging one request means following a request ID or trace across processes.
- ⚠️ **Data duplication.** Read models (e.g. Billing's consumption read model, Reading's copy of meter data) have to be kept in sync and rebuilt from events.
- ⚠️ **Steeper learning curve and schedule risk** for a part-time team. Infrastructure work competes with domain work. Mitigations: build one service properly first (M1), skip stretch goals before tests, and follow the Roadmap's "if you fall behind" guidance.
- ⚠️ **Refactoring boundaries is expensive.** A wrong split costs a data migration across databases plus contract changes. M0 boundary review (Checkpoint A) is our main defence.

**What we give up compared with a modular monolith** (M0 reflection question): simple ACID transactions across billing and payments, one deployable and one log stream, refactoring across modules with a compiler instead of contracts, and lower hosting and operations cost. We get back independent deployability and failure isolation, which at our scale we mainly want for learning, not because we have to have them.

## Revisit when
- Two services start calling each other synchronously for most requests (a sign the boundary is wrong). Consider merging them.
- Operations work keeps crowding out domain work across two or more milestones. Consider collapsing low-value services, e.g. folding Notification into a module.

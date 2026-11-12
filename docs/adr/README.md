# Architecture Decision Records

Any decision that would be expensive to reverse gets an ADR here. Use [template.md](template.md) and name files `NNNN-kebab-case-title.md`. Never edit an accepted ADR's decision. Supersede it with a new ADR and update both statuses.

The project expects 12–20 ADRs by the end, **including at least one decision that is later reversed** (ADR-0020).

| ADR | Decision | Milestone | Status |
|---|---|---|---|
| [ADR-0001](0001-adopt-microservice-architecture.md) | Adopt microservice architecture | M0 | **Proposed**, awaiting review at Checkpoint A |
| ADR-0002 | Select HTTP framework (plan: Fastify) | M1 | Not started |
| ADR-0003 | Select ORM / data access strategy (plan: Prisma) | M1 | Not started |
| ADR-0004 | Select authentication / token strategy | M2 | Not started |
| ADR-0005 | Customer-account identity linking | M2 | Not started |
| ADR-0006 | Gateway implementation | M3 | Not started |
| ADR-0007 | Reading Service data ownership strategy | M4 (revisit M7) | Not started |
| ADR-0008 | Money representation and rounding | M5 | Not started |
| ADR-0009 | Bill-run execution strategy | M5 | Not started |
| ADR-0010 | PDF generation approach | M5 | Not started |
| ADR-0011 | Broker selection and topology | M7 | Not started |
| ADR-0012 | Event contract / versioning strategy | M7 | Not started |
| ADR-0013 | BFF versus direct browser-to-gateway | M6 | Not started |
| ADR-0014 | Reader PWA storage / sync approach | M8 | Not started |
| ADR-0015 | Kubernetes: Helm versus Kustomize | M10 | Not started |
| ADR-0016 | GitOps / deployment strategy | M10 | Not started |
| ADR-0017 | Observability stack | M11 | Not started |
| ADR-0018 | Backup and restore strategy | M12 | Not started |
| ADR-0019 | Security baseline | M12 | Not started |
| ADR-0020 | A significant decision later reversed | any | Not started |

Decisions that may need an ADR outside this plan:
- **Repo host / CI / registry** (Gitea vs. GitHub/GHCR). This is required if Gitea is chosen, because it changes the documented plan. See [assumptions.md](../assumptions.md) Q-02.
- **Monorepo tooling** (npm/pnpm workspaces, Turborepo), from M1.
- **Reshaping the suggested repository structure**. The Roadmap §4.1 asks for an ADR if it changes.

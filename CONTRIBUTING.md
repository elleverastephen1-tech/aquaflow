# Contributing to AquaFlow

These rules come from the Learning Roadmap (§1.3) and the Development Plan (CI/CD › Branch and commit policy).

## Branches and pull requests

- One branch per task, named after the card: `dom-004-context-map`, `cust-012-meter-replacement`.
- One pull request per task, even when working solo. Review your own PR if nobody else can.
- `main` must always stay deployable. Never push directly to `main`.
- Once CI exists (M9), a PR can only merge when every required check passes.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(billing): add tier calculator
fix(reading): stop R1 firing after a meter replacement
docs(adr): add ADR-0002 HTTP framework
test(customer): cover second active meter returning 409
chore(repo): add editorconfig
```

The scope is a service name (`gateway`, `auth`, `customer`, `reading`, `billing`, `payment`, `notification`), `web`, a package name, or `repo`/`docs`/`infra`.

## Task IDs

Cards use the Development Plan's patterns: `DOM-`, `CUST-`, `AUTH-`, `READ-`, `BILL-`, `WEB-`, `PAY-`, `NOTIF-`, `PWA-`, `CI-`, `K8S-`, `OBS-`, `SEC-`, `PERF-`, `OPS-###`. Put the ID in the branch name and the PR title.

## Definition of Done (every task)

A task is done when the behavior works, the expected failure cases are checked, and another person can follow the docs or reproduce the test. Writing the code is not enough. Check each item, or mark it "N/A" with a reason:

- [ ] Goal, acceptance criteria and dependencies are on the card
- [ ] Implemented in the correct owning service
- [ ] Invalid input, missing data and boundary cases are handled and tested
- [ ] Authorization, data isolation and sensitive logging are checked
- [ ] Lint, typecheck and relevant tests pass
- [ ] Logs, request IDs, metrics or traces added where relevant
- [ ] Docs, ADRs and known limitations are updated
- [ ] PR reviewed; the behavior can be demonstrated
- [ ] Evidence saved under `docs/evidence/<milestone>/`; card and journal updated

## Decisions

- Any decision that would be expensive to reverse gets an ADR in `docs/adr/` (template: `docs/adr/template.md`).
- If a requirement is ambiguous, write an explicit assumption in `docs/assumptions.md` or an ADR. Do not silently invent behavior.

## Secrets

- Never commit `.env` files, keys, tokens or passwords. Commit `.env.example` with variable names only.
- Development-only credentials may be documented for local use. Production credentials never are.
- Never log passwords, access or refresh tokens, payment secrets or sensitive personal data.
- `docs/evidence/` must never contain secrets, real customer data, payment credentials or private keys.

## Journal

Add 3–5 lines to `docs/journal.md` per working session: what you did, what confused you, what you learned. Answer the milestone reflection questions there.

## When stuck

If you are stuck for more than 90 minutes, write down what you tried and ask for help in the project channel.

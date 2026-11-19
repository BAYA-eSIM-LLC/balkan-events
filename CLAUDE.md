# CLAUDE.md — BALKAN EVENTS

> Permanent development rules for the BALKAN EVENTS project.
> Place this file in the repository root. Read it fully at the start of every session.
> If a request conflicts with this file, stop and ask. Do not silently deviate.

---

## 1. Project identity

- **Product:** BALKAN EVENTS — regional event discovery and ticketing platform
- **Slogan:** DISCOVER. BOOK. EXPERIENCE.
- **Owner:** BAYA eSIM LLC (sole legal owner)
- **Brand status:** BALKAN EVENTS is a commercial brand and product of BAYA eSIM LLC. It is **not** a separate legal entity.
- **Platforms:** Web, iOS, Android, plus a separate Scanner app
- **Primary markets:** Bosnia and Herzegovina, Croatia, Serbia
- **Expansion markets:** Montenegro, Slovenia, North Macedonia, Albania, Kosovo, Bulgaria, Romania, Greece, Turkey
- **Vision:** premium, scalable, multi-country event ticketing ecosystem for Southeast Europe
- **Delivery principle:** ambitious vision, controlled incremental implementation

### 1.1 Ownership and control (non-negotiable)

1. BAYA eSIM LLC is the **sole legal owner** of BALKAN EVENTS and of all project intellectual property: source code, database schemas, design files and design system, brand assets, documentation and technical architecture.
2. BAYA eSIM LLC **owns and controls all platform infrastructure and project accounts**: Git repositories, cloud accounts, domains and DNS, databases, CI/CD, monitoring, Apple Developer account, Google Play Developer account, the platform's own accounts with payment providers and other vendors, and all API keys and credentials.
3. Never register project accounts, domains or services under personal or third-party identities. If a project account is needed, produce step-by-step instructions for the owner to create it under BAYA eSIM LLC.
4. Never create or imply another legal company, brand owner or account holder for the project.
5. Never introduce unrelated companies or brands into code, copy, docs, legal text or configuration.
6. Contractor and vendor work must transfer IP to BAYA eSIM LLC, grant source and documentation access, and hand over all credentials (see section 17).

### 1.2 Partnerships and integrations are explicitly allowed

The ownership rules above are **not** a prohibition on third-party integrations or commercial partnerships. BALKAN EVENTS is a marketplace platform and is expected to work with:

- independent event organizers, promoters, venues, sports clubs and cultural institutions
- payment providers, payment service providers and banks
- technology vendors (hosting, email, SMS, push, analytics, maps, monitoring, search, identity, anti-fraud)
- Apple, Google and other app store, wallet and platform partners
- other legitimate business partners (affiliates, sponsors, influencers, resellers, white-label clients)

Rules for working with partners:

1. Name third parties where factually relevant (integration code, provider adapters, legal documents, app store listings, organizer legal names, invoices).
2. Evaluate integrations **on merit** in an ADR: capability, security, cost, compliance, data residency, reliability and exit path. Being third-party is never a reason to reject an integration.
3. Design for **portability and control**, not avoidance: put providers behind interfaces/adapters, keep BAYA eSIM LLC as the account holder of platform-level vendor accounts, keep data exportable, and document an exit path. This is a design principle, not a ban.
4. Independent organizers are customers and partners of the platform, not part of BAYA eSIM LLC. Their legal entities, bank accounts, event content and rights remain theirs, subject to the organizer agreement (terms to be confirmed by qualified counsel).
5. Never block or remove a legitimate integration, vendor or partner feature on the basis of the ownership rules. If you think an ownership rule and a partnership requirement conflict, stop and ask the owner.

### 1.3 Two kinds of accounts: do not confuse them

| | **Project / infrastructure accounts** | **Platform user accounts** |
|---|---|---|
| What | Repos, cloud, domains, DNS, app store developer accounts, vendor and payment-provider platform accounts, API keys, CI/CD | Accounts created inside the BALKAN EVENTS product |
| Controlled by | BAYA eSIM LLC only | The individual or organization they represent, within platform rules |
| Who may have them | Authorized BAYA eSIM LLC personnel and approved contractors, with MFA | **Customers, independent organizers and their team members, scanner staff, BAYA eSIM LLC employees and administrators** |

Rules for platform user accounts:

1. Customers can self-register and manage their own accounts, tickets and data.
2. Independent organizers can create their own organization accounts and add their own team members with assigned roles (admin, event manager, marketing manager, finance manager, scanner operator). Verification badges appear only after a recorded review.
3. BAYA eSIM LLC employees and administrators receive platform admin accounts provisioned by authorized admins, with role-based access and mandatory MFA.
4. Platform user accounts are **not** project accounts and must never be given project-level credentials, repository access, cloud access or API keys by virtue of being platform users.
5. Tenancy isolation: an organizer can only see and manage its own organization's data. BAYA admins can suspend or moderate accounts under documented policy, with audit logging.
6. Account data belongs to the account holder under the platform terms and applicable data protection law (to be confirmed by qualified counsel). BAYA eSIM LLC remains responsible for operating the platform and protecting that data.

---

## 2. Phase discipline

Work happens in **controlled phases**. One phase at a time.

| Phase | Scope |
|---|---|
| 0 | Audit, architecture, ERD, API contracts, security, infrastructure, ADRs. **No production code.** |
| 1 | Core MVP (incrementally, see sub-phases in the approved roadmap) |
| 2 | Mobile apps, push, wallets |
| 3 | Seat map, social, recommendations, event map, waitlists, marketing engine, advanced analytics |
| 4 | Regional expansion |

Rules:

1. Never start a phase, or part of a phase, that the owner has not explicitly approved in writing in the current session.
2. The approved roadmap lives in `docs/phase-0/10-roadmap-and-acceptance.md`. It is the source of truth for scope and acceptance criteria.
3. At the end of every phase or sub-phase, **STOP** and deliver a report (see section 14). Wait for explicit approval.
4. Do not pre-build features from later phases "to save time". No speculative code.
5. Do not expand scope. If something new seems necessary, propose it in the report and wait.
6. Silence or a "looks good" about a partial item is not approval for the next phase. Approval must name the phase.

---

## 3. Absolute prohibitions

Never do any of the following:

- Deliver only mockups or screenshots when working code was requested.
- Create buttons, pages or endpoints that do nothing.
- Return fake backend responses or fabricated data in any environment except clearly labelled, isolated test fixtures.
- Use fabricated transaction data, users, sales, reviews, ratings or popularity statistics in production or demo views that look real.
- Hardcode business-critical settings (commission, fees, taxes, currencies, limits, reservation timeouts, payout rules).
- Claim that an integration works unless it has been tested, and state how it was tested.
- Mark unfinished work as completed.
- Expose secrets, tokens or API keys in source, logs, docs, tests, commits or screenshots.
- Store raw card data (PAN, CVV, full magnetic stripe) anywhere.
- Allow duplicate ticket sales (overselling).
- Allow duplicate ticket entry (same ticket accepted twice).
- Activate live payments or payouts without recorded written authorization from the owner **and** the payment provider.
- Skip security tests, database migrations, validation or error handling.
- Overwrite or delete existing working files without understanding them and recording why.
- Compromise the existing working project.
- Introduce microservices before an ADR justifies it.
- Display a "Verified" badge without a recorded review.
- Build or imply unauthorized ticket resale.
- Present planned or unbuilt features (including "AI") as existing.

---

## 4. Honesty and reporting standards

1. Report what is true, not what is hoped. Distinguish: **Done and tested / Done, not tested / Partial / Not started / Blocked**.
2. Every claim of completion must reference evidence: test output, command output, file paths, commit hash.
3. If a feature cannot be completed, state what is missing and why. Do not hide it.
4. Do not invent versions, API behavior, provider capabilities, legal requirements or prices. If unknown, write **UNVERIFIED** and list how to verify.
5. When provider or legal facts matter (payments, tax, ticketing law, data protection), mark them as **requiring confirmation by the owner or qualified counsel**. You are not a lawyer or tax advisor.
6. Do not assume tools, runtimes, services or accounts exist. Inspect first.

---

## 5. Technology baseline

Preferred stack. Verify availability in the actual environment before relying on it. Any change requires an ADR.

| Layer | Choice |
|---|---|
| Web | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, REST (OpenAPI), WebSocket only where real-time is justified |
| Database | PostgreSQL (system of record), Redis (cache, rate limits, short locks) |
| Mobile | React Native, TypeScript |
| Infra | Docker, Nginx, CI/CD, object storage, CDN, WAF, monitoring, automated backups |

Architecture principles:

1. **Modular monolith first.** Clear module boundaries; no cross-module database access except through defined interfaces.
2. Design UI and API so they do not depend on one specific vendor.
3. PostgreSQL is the source of truth for inventory, orders, tickets and money. Redis is never the only record of anything financial or inventory-critical.
4. Every module owns its tables, services, schemas, routes and tests.
5. Prefer boring, well-understood solutions. Justify novelty in an ADR.

---

## 6. Multi-country and configuration rules

The platform is multi-country from day one. Therefore:

1. Countries, cities, languages, currencies, tax rules, fees, commissions, payment methods, payout rules and legal texts are **data/configuration**, not code.
2. All user-facing strings go through i18n. No hardcoded copy in components or API errors meant for users.
3. Store money as integer minor units plus ISO 4217 currency code. Never use floating point for money.
4. Store timestamps in UTC; render in the event venue's time zone.
5. Support Latin and Cyrillic Serbian as separate locales.
6. Plan for BGN to EUR transition via configuration.
7. Commission defaults (for testing only): standard 4.9%, high-volume 3.9%, enterprise negotiated. These are **configurable by platform administrators** and must never appear as constants in business logic.

---

## 7. Ticketing integrity invariants

These must hold under concurrency, retries, crashes and malicious input. Each must have automated tests.

1. **No overselling:** sold + reserved never exceeds capacity. Enforced in the database (constraints, row locks or atomic conditional updates), not only in application code.
2. **Reservations expire** automatically and release inventory; expiry is idempotent.
3. **Atomic purchase:** order, payment record, inventory change and ticket issuance are consistent. A failure at any step leaves a recoverable, auditable state.
4. **Idempotency:** purchase and payment-related endpoints accept idempotency keys. Replays never create duplicate orders, charges or tickets.
5. **Ticket validity:** QR payloads are signed/opaque tokens; the server is the authority. Never trust a client-side result.
6. **Single entry:** a ticket can be admitted once. Concurrent scans from several devices result in exactly one `VALID`. Others return `USED`.
7. **Seats:** one seat can be held or sold to one buyer only. Same guarantees as inventory.
8. **Transfers and refunds** invalidate old tokens and issue new ones where applicable.
9. **Offline scanning** is a limited mode with a defined sync and conflict policy documented in an ADR. It must never be presented as equivalent to online validation.
10. No resale or exchange feature without organizer approval and fraud controls.

Scan statuses: `VALID`, `USED`, `INVALID`, `CANCELLED`, `OFFLINE`.

---

## 8. Payments and financial rules

1. **Never store raw card data.** Use hosted fields or provider redirects. Aim for the lowest PCI scope.
2. Verify the signature of every payment webhook. Reject unsigned or replayed events.
3. Use idempotency keys for every outbound payment call.
4. Record every transaction and state change in an append-only ledger. Do not edit or delete ledger entries; post compensating entries.
5. Keep **platform revenue** and **organizer funds** separate in data model, ledger and reports.
6. Support refunds, partial refunds, chargeback records and reconciliation against provider reports.
7. Track settlement and payout statuses. Payouts require authorization workflow and cannot be triggered by a single unaudited action.
8. **Do not assume** an existing Stripe account authorizes marketplace ticketing or third-party organizer payouts. Stripe Connect and any local provider require **written provider approval** and country eligibility confirmation. Payment providers are legitimate partners: evaluate them on merit and record unresolved approvals in the provider approval register. The platform-level provider account is held by BAYA eSIM LLC; independent organizers may hold connected or payout accounts under the provider's marketplace model, if and when approved.
9. Use sandbox/test mode only until the owner confirms in writing that provider approval and legal checks are complete. Live keys must never exist in dev or CI environments.
10. Fees, taxes, VAT treatment and invoicing rules vary by country. Treat them as configuration and mark legal interpretation as requiring qualified confirmation.
11. Show buyers the ticket price, fees, taxes and total clearly before payment.

---

## 9. Security rules

Mandatory baseline:

- Strong password hashing (Argon2id or bcrypt with justified parameters); never log or return hashes.
- MFA required for all privileged accounts (platform admins, finance roles, organizer admins handling money).
- Role-based access control with least privilege; deny by default; check authorization on the server for every request.
- TLS everywhere; HSTS; secure cookies (`HttpOnly`, `Secure`, `SameSite`); short-lived tokens with rotation/revocation.
- Input validation at every boundary (schemas); parameterized queries only; output encoding; CSRF protection for cookie-based sessions; strict CSP.
- Rate limiting and bot protection on auth, checkout, scanning, waitlist and search endpoints.
- Encrypt sensitive data at rest; encrypt secrets; rotate keys; never commit secrets. Use a secrets manager or environment injection; ship only `.env.example`.
- Audit log for all critical actions (admin actions, role changes, refunds, payouts, commission changes, event moderation, verification decisions, data exports). Audit logs are append-only.
- Webhook signature verification; replay protection.
- Secure QR token generation (cryptographically strong, signed, non-guessable, rotatable).
- Dependency scanning, secret scanning and SAST in CI.
- Backups automated and **restore-tested**.
- Fraud monitoring hooks: velocity checks, anomalous scan patterns, bulk-buy detection.
- Never log PII, tokens, full payloads of payments or QR secrets.

Security findings must be recorded, not hidden. Severity: Critical / High / Medium / Low.

---

## 10. Privacy and legal

1. Treat personal data under GDPR-aligned principles for all markets, plus applicable local laws (to be confirmed per country by qualified counsel).
2. Collect the minimum data needed. Record purpose and retention for each personal data field.
3. Consent is required and recorded for marketing email, push notifications and tracking. Provide easy opt-out.
4. Recommendation and social features use only **permitted** user activity and respect privacy settings.
5. Support data export and deletion requests by design.
6. Cookie and analytics tracking must respect consent.
7. Paid or sponsored placements must be clearly labelled as such.
8. Abandoned-checkout reminders only where legally permitted and consented.
9. Organizer verification: show status only after an actual recorded review.
10. Regional dependencies to track in the legal register: consumer protection and refund rules, VAT/tax treatment of ticket sales, ticketing and resale regulation, e-money/payment-institution licensing questions, data protection, local invoicing, and terms for organizers and buyers. All **require confirmation by qualified local counsel**.

---

## 11. Testing standards

1. Every feature ships with tests. A feature without tests is not done.
2. Required test coverage areas for core flows: registration/login, permissions (user, organizer, admin), event creation, inventory, **concurrent purchases**, payment success/failure, webhook verification, refunds, QR generation, **duplicate scanning**, offline sync, seat reservation conflicts, admin permissions, migrations (up and down), backup and restore.
3. Concurrency tests must run real parallel requests against a real PostgreSQL, not mocks.
4. Never mock away the database for inventory, order or scan logic tests.
5. Tests must be deterministic. Flaky tests are bugs; fix or quarantine with a tracked issue.
6. Run the full relevant suite before reporting a phase complete. Include the output summary in the report.
7. Do not weaken or delete a test to make it pass. If a test is wrong, explain why in the commit.

---

## 12. Code and repository standards

1. **Branching:** `main` is protected and always deployable. Work on short-lived feature branches. No direct commits to `main`.
2. **Commits:** small, atomic, imperative messages, reference the task/ADR. Conventional Commits recommended.
3. **Migrations:** every schema change has a reviewed, reversible migration. Never edit an applied migration; add a new one. Test migrations from empty and from the previous version.
4. **Types:** strict TypeScript; typed Python (mypy or pyright). No `any` / untyped escape hatches without comment.
5. **Lint/format:** enforced in CI (ESLint, Prettier, Ruff, Black or equivalent).
6. **Errors:** explicit, typed, logged with correlation IDs; user-facing messages localized and non-leaky.
7. **API:** versioned (`/api/v1`), described by OpenAPI, consistent error envelope, pagination, idempotency where required.
8. **Config:** twelve-factor; environment-driven; `.env.example` maintained; no secrets in repo.
9. **Observability:** structured logs, metrics, tracing hooks, health and readiness endpoints.
10. **Dependencies:** pin versions; justify each new dependency; check license and maintenance status.
11. **Existing code:** read before changing. Do not refactor unrelated code. Preserve working behavior.
12. Keep functions and modules small and cohesive. Respect module boundaries.

### Planned repository layout (confirm in Phase 0 before use)

```
/apps
  /web            # Next.js consumer site, organizer portal, admin
  /mobile         # React Native consumer app
  /scanner        # React Native scanner app
/services
  /api            # FastAPI modular monolith
/packages         # shared types, UI kit, i18n, config
/infra            # Docker, Nginx, IaC, CI/CD
/docs             # architecture, ADRs, runbooks, phase reports
/tests            # cross-cutting integration and e2e
```

Layout may change only through an ADR.

---

## 13. Design and UX rules

1. Premium, modern, internationally competitive. Avoid generic templates.
2. Palette: Midnight Navy (main dark), Electric Blue (primary action), Violet (secondary accent), White, Neutral Gray. Dark Mode and Light Mode both mandatory.
3. Mobile-first; responsive desktop/tablet/mobile.
4. Accessibility: WCAG 2.2 AA target for contrast, focus, keyboard, screen reader labels, touch targets.
5. Minimal steps to payment. Clear confirmations and errors.
6. Design all states: empty, loading, error, payment failure, unavailable tickets, cancelled event, refund.
7. Use a single design system with reusable components and design tokens.
8. Real content only. No fake events, fake prices or fake social proof in production.

---

## 14. Required report at the end of every phase or task

Use exactly this structure:

```
## Report: <phase/task name>
### Summary (3–5 lines)
### Done and tested
- item — evidence (test name / command / path / commit)
### Done, not tested
### Partial
### Not started
### Blocked (and by whom/what)
### Test results (commands run, pass/fail counts)
### Security findings (severity, status)
### Known issues
### Decisions made (ADR refs)
### Open questions for the owner
### Proposed next step
### STOP — awaiting owner approval
```

Never omit a section; write "None" if empty.

---

## 15. Documentation rules

1. Docs live in `/docs` and are updated in the same change as the code.
2. Architecture decisions are recorded as ADRs: `docs/adr/ADR-NNNN-title.md` (Context, Decision, Alternatives, Consequences, Status).
3. Maintain: architecture overview, ERD, API reference (OpenAPI), security documentation, deployment guide, backup/restore runbook, incident runbook, environment variable reference, legal/dependency register, risk register.
4. Diagrams use Mermaid in Markdown so they are versioned and diffable.

---

## 16. Environment safety

1. Inspect the real environment before assuming anything (OS, runtimes, package managers, Docker, databases, git state, existing services).
2. Phase 0 inspection is **read-only**. Do not install, upgrade, delete, start or stop anything without approval.
3. Never run commands against production systems, real project accounts or real partner/provider accounts without explicit owner approval.
4. Never run destructive commands (`rm -rf`, `DROP`, force push, history rewrite) without explicit approval.
5. If the working tree is dirty or contains unfamiliar files, report it and do not touch them.

---

## 17. Deliverables that must end up under BAYA eSIM LLC control

Complete source code (web, backend, mobile, scanner), database schema and migrations, API documentation, admin panel, organizer portal, consumer website, design system and Figma files, deployment configuration, automated tests, security documentation, backup and recovery instructions, architecture documentation, environment template, production deployment guide, plus all project accounts (repositories, cloud accounts, domains and DNS, app store developer accounts, platform-level vendor and provider accounts) and API keys. This list concerns **project accounts** only; platform user accounts of customers, organizers and staff are covered in section 1.3.

---

## 18. When in doubt

Stop. Ask one precise question. Do not guess on money, security, legal or data-loss matters.

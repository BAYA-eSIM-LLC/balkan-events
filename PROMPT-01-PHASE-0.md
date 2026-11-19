# PROMPT-01 — PHASE 0: AUDIT AND ARCHITECTURE

**Project:** BALKAN EVENTS — DISCOVER. BOOK. EXPERIENCE.
**Owner:** BAYA eSIM LLC
**Phase:** 0 of 4
**Output type:** Documentation only. No production code.

> Paste everything below this line into a fresh Claude Code session started in the repository root.
> If `CLAUDE.md` is not yet in the repo root, add it first.

---

## 1. Read first

Before anything else, read `CLAUDE.md` in the repository root if it exists. Its rules are binding for this phase and every later phase. If it does not exist, say so in your first message and continue to follow the rules in this prompt.

---

## 2. Context

BALKAN EVENTS is a commercial brand and product of **BAYA eSIM LLC**, the sole legal owner of the project and of all project intellectual property. It is not a separate legal entity. BAYA eSIM LLC owns and controls all platform infrastructure and project accounts.

Ownership does **not** mean isolation. The platform is a marketplace and is **expected to integrate and work with** independent event organizers, payment providers, banks, technology vendors, Apple, Google and other legitimate business partners. Independent organizers, BAYA eSIM LLC employees and customers must be able to create their own authorized user accounts inside the platform. Do not interpret ownership rules as a prohibition on third-party integrations or commercial partnerships. Do not create another legal company or introduce unrelated companies into the product.

Vision: a premium, scalable, multi-country event discovery and ticketing platform for Southeast Europe.

- **Initial markets:** Bosnia and Herzegovina, Croatia, Serbia
- **Expansion markets:** Montenegro, Slovenia, North Macedonia, Albania, Kosovo, Bulgaria, Romania, Greece, Turkey
- **Platforms:** Web, iOS, Android, separate Scanner app
- **Languages (planned):** Bosnian, Croatian, Serbian (Latin), Serbian (Cyrillic), English, Slovenian, Montenegrin, Albanian, Macedonian, Bulgarian, Romanian, Greek, Turkish
- **Currencies (planned):** EUR, BAM, RSD, RON, BGN (with EUR transition), others per market
- **Preferred stack (to be verified, not assumed):** Next.js, React, TypeScript, Tailwind; FastAPI (Python); PostgreSQL; Redis; React Native; Docker; Nginx; CI/CD; object storage; CDN; WAF; monitoring; backups
- **Architecture starting point:** modular monolith, clear module boundaries, no microservices without an ADR
- **Six systems in the long-term vision:** (A) consumer discovery, (B) ticketing engine, (C) Organizer Pro, (D) Admin Control Center, (E) Smart Scanner, (F) Seat Map Engine
- **Differentiators for later phases:** social discovery, rule-based recommendations, group experience, event map, promotion marketplace, verified organizers, waitlist

The long-term vision stays ambitious. **Implementation must be controlled and incremental.**

---

## 3. Your task in this phase

Produce a complete, reviewable architecture package as **Markdown documents only**, and then **STOP**.

### Hard constraints for Phase 0

1. **Do not write production code.** No application code, no executable migrations, no scaffolding, no config that runs.
2. **Do not modify any existing project file.** You may create new files only, and only under `docs/phase-0/` and `docs/adr/`.
3. **Inspection is read-only.** Do not install, upgrade, remove, start or stop anything. Do not run builds, tests or migrations. Do not connect to production systems or external accounts.
4. **Do not assume** any technology, service or account is installed or available. Verify by inspection and record the evidence.
5. Illustrative snippets are allowed only inside documents as small, clearly labelled examples (e.g., an API request/response shape, a table definition in Markdown, a Mermaid diagram). They must not be placed in source directories.
6. Mark anything you cannot verify as **UNVERIFIED** with how to verify it.
7. Anything about payment-provider eligibility, tax, VAT, ticketing law, consumer protection, e-money or data protection must be marked **REQUIRES CONFIRMATION BY OWNER / QUALIFIED COUNSEL**. You do not give legal advice.
8. At the end, **STOP.** Do not begin Phase 1. Do not scaffold anything "to save time".
9. Do not treat ownership rules as a reason to exclude, avoid or downgrade third-party integrations or partners. Evaluate each on merit and design for portability (adapters, data export, exit paths).

---

## 4. Step-by-step work plan

Work in this order. After each step, briefly state what you found before continuing.

### Step A — Environment inspection (read-only)

Inspect and record evidence (command + summarized output) for:

- Operating system, shell, CPU/RAM/disk (as relevant)
- Installed runtimes and versions: Node.js, npm/pnpm/yarn, Python, pip/poetry/uv, Docker, Docker Compose, git
- Databases and services reachable locally: PostgreSQL, Redis (only detect; do not start)
- Mobile toolchain presence: Xcode, Android SDK, Java, CocoaPods, Expo/React Native CLI (detect only)
- Git state: current branch, remotes, uncommitted changes, recent history summary, `.gitignore`, hooks
- Repository tree: top-level structure, languages, frameworks, package manifests, lockfiles
- Existing configuration: CI files, Dockerfiles, compose files, env templates (do **not** print secret values; if secrets are found, report location only and treat as a security finding)
- Existing documentation, READMEs, TODOs, prior architecture notes
- Existing integrations: payments, email, SMS, storage, analytics, auth providers, domain/DNS hints
- **Technology and dependency inventory:** every package manifest and lockfile (npm/pnpm/yarn, pip/poetry/uv, Gradle, Pods), direct dependencies with versions, notable transitive risks, license types, outdated or unmaintained packages, known-vulnerable packages if detectable from existing lockfiles or audit reports (do not run installs or network audits; if an audit tool would need installation or network, list it as UNVERIFIED), container base images, CI actions and external services referenced in config
- Existing third-party accounts and partner relationships visible in config or docs (names only; no secret values), and which legal entity appears to hold them (UNVERIFIED unless documented)
- Existing tests and their apparent coverage (do not run them)
- Whether a `CLAUDE.md` or similar rules file already exists

If the repository is empty or unrelated, say so explicitly. Do not invent a "current state".

### Step B — Reuse analysis

Produce a reuse matrix: for each existing asset (code, config, library, infra, design), classify as **Reuse as is / Reuse with changes / Reference only / Do not reuse**, with a reason and risk. Be explicit about what is **missing and must be built**.

If the repository contains an unrelated product, treat it as out of scope and do not couple BALKAN EVENTS to it unless the owner approves.

### Step C — Architecture package

Create the documents listed in section 5. Each must be complete enough that a senior engineer who has never seen the project can implement from it.

### Step D — Roadmap and acceptance criteria

Create the phased roadmap with **measurable acceptance criteria for every subsequent phase and sub-phase** (section 6).

### Step E — Risks, dependencies and open questions

Create the risk register, dependency register and a short, prioritized list of decisions the owner must make.

### Step F — Self-review and report

Review your own documents for contradictions, gaps and unverifiable claims. Then produce the Phase 0 report (section 8) and **STOP**.

---

## 5. Required deliverables

Create these files (new files only):

```
docs/phase-0/
  00-environment-audit.md
  01-reuse-matrix.md
  02-system-architecture.md
  03-domain-model-erd.md
  04-api-contracts.md
  05-security-architecture.md
  06-infrastructure-architecture.md
  07-payments-and-financial-reconciliation.md
  08-legal-and-regional-dependencies.md
  09-multi-country-configuration.md
  10-roadmap-and-acceptance.md
  11-risk-register.md
  12-open-questions-for-owner.md
  13-phase-0-report.md
docs/adr/
  ADR-0001 … (one file per decision)
```

### 5.1 `00-environment-audit.md`
Findings from Step A with evidence. Table of tools: name, required version (if known), found version, status (Present / Missing / Unverified). Git state summary. Secret-exposure findings (location only).

### 5.2 `01-reuse-matrix.md`
Reuse matrix from Step B. Section "Must be built" listing every major component with no existing counterpart.

### 5.3 `02-system-architecture.md`
- Context diagram and container diagram (Mermaid, C4 style)
- Module map of the **modular monolith** with module responsibilities, owned tables, public interfaces and allowed dependencies between modules (dependency direction table)
- Proposed modules at minimum: identity & access, organizations & organizers, catalog (countries, cities, venues, categories), events, ticketing & inventory, seat maps, orders & checkout, payments, ledger & settlements, tickets & QR, scanning, refunds, promotions & campaigns, notifications, favorites & follows, waitlist, recommendations, analytics, audit, admin, configuration
- Which modules are Phase 1 vs later
- **Module boundary rules:** for each module, its public interface, owned tables, events emitted/consumed, allowed and forbidden dependencies, and how boundaries are enforced (e.g., import rules, lint checks, schema ownership), plus criteria for when a module may be extracted into a service
- **Integration and partner map:** diagram and table of every external party the platform is expected to work with (payment providers, banks, Apple, Google, email/SMS/push vendors, maps, analytics, monitoring, KYC/verification vendors, independent organizers' systems, affiliates), the integration direction, data exchanged, adapter/port boundary, account holder (BAYA eSIM LLC for platform-level vendor accounts), approval status (UNVERIFIED unless evidenced) and exit path
- Runtime view of key flows as sequence diagrams: browse → reserve → pay → issue tickets; payment webhook handling; QR scan (online); QR scan (offline + sync); refund; reservation expiry; organizer onboarding and verification; payout authorization
- Concurrency and consistency strategy for inventory and seats (specify mechanism, trade-offs, failure modes)
- Real-time needs and where WebSocket is justified (and where it is not)
- Caching strategy and what must never be cached
- Search and discovery approach for Phase 1 (e.g., PostgreSQL full-text vs external engine) with trade-offs
- Media handling (upload, processing, CDN)
- Background jobs and scheduling (reservation expiry, notifications, reconciliation)
- Observability architecture (logs, metrics, traces, alerts)
- Frontend architecture: web apps structure, SSR/SEO strategy, design tokens, i18n approach, Dark/Light mode, accessibility
- Mobile architecture outline (consumer app, scanner app) and code sharing strategy
- How the design is kept independent of a single technology where required

### 5.3a Diagram rules
Use Mermaid in fenced code blocks. Keep each diagram readable. If a diagram is too large, split it.

### 5.4 `03-domain-model-erd.md`
- Mermaid ERD for the full target model, split into logical sub-diagrams (identity, org/organizer, catalog/venue, events/ticketing, orders/payments/ledger, tickets/scans, seats, promotions/marketing, social/notifications, audit/config)
- For every entity in the following minimum list, a table with columns, types, nullability, keys, constraints, indexes and notes:
  `users, user_profiles, organizations, organization_members, organizers, countries, cities, venues, events, event_categories, ticket_types, ticket_inventory, seat_maps, seats, seat_reservations, orders, order_items, tickets, ticket_transfers, ticket_scans, payments, refunds, settlements, commissions, promotions, promo_codes, campaigns, affiliates, notifications, favorites, follows, event_waitlists, audit_logs`
- Add any entities you judge necessary and justify them (examples to evaluate: ledger entries, payout instructions, webhook events, idempotency keys, consent records, roles/permissions, device registrations, verification reviews, tax configurations, fee schedules, translations)
- Money representation (integer minor units + currency code), time zone policy, soft-delete policy, ID strategy (e.g., UUID vs ULID) with ADR
- Database-level invariants that enforce: no overselling, single ticket admission, one buyer per seat, append-only ledger and audit log
- Index strategy and expected query patterns
- Partitioning/archival considerations for scans, audit logs and ledger
- Migration strategy and naming conventions
- Data classification (public / internal / confidential / restricted) per field group, with retention suggestions marked as requiring legal confirmation

### 5.5 `04-api-contracts.md`
- API conventions: versioning, auth, pagination, filtering, sorting, error envelope, idempotency headers, rate-limit headers, localization, correlation IDs
- Endpoint catalogue **for Phase 1 scope in full detail** (method, path, auth/role, request schema, response schema, error codes, idempotency, rate limit, side effects, audit events)
- Endpoint catalogue for later phases at summary level
- Webhook contracts (inbound from payment providers; outbound to organizers if planned) with signature verification and replay protection description
- Scanner API contract including online and offline sync semantics, conflict resolution and status codes `VALID`, `USED`, `INVALID`, `CANCELLED`, `OFFLINE`
- WebSocket channels (only where justified) with message schemas
- Authorization matrix: roles × resources × actions (user, organizer roles: admin, event manager, marketing manager, finance manager, scanner operator; platform admin roles)
- Illustrative OpenAPI structure outline (as a Markdown description, **not** a runnable file)

### 5.6 `05-security-architecture.md`
- Threat model (STRIDE or equivalent) for: checkout, inventory, payments/webhooks, QR tickets, scanner, organizer onboarding, admin, payouts, media upload, public API, mobile apps
- Authentication design: email/password, optional Apple/Google sign-in (assess), sessions vs tokens, refresh/rotation, MFA for privileged roles, account recovery, lockout, device trust
- Authorization design: RBAC model, tenancy isolation between organizers, admin separation of duties
- **Account taxonomy:** distinguish (a) project/infrastructure accounts controlled by BAYA eSIM LLC from (b) platform user accounts created inside the product by customers, independent organizers and their team members, scanner staff, and BAYA eSIM LLC employees/admins. Define for each: how it is created (self-service, invitation, admin provisioning), verification, roles, MFA requirements, tenancy scope, suspension and offboarding, and what it can never access (project credentials, infrastructure)
- QR token design: format, signing, rotation, offline verification trade-offs, replay and screenshot-sharing mitigation, transfer invalidation
- Fraud controls: velocity limits, bulk-buy detection, anomalous scan patterns, account takeover, card-testing
- Secrets management, key rotation, environment separation
- Data protection: encryption in transit/at rest, field-level encryption candidates, PII minimization, logging rules
- Web/app security controls: CSRF, XSS, CSP, CORS, clickjacking, SSRF, file upload safety, dependency and supply-chain controls
- Audit logging: events list, immutability approach, retention
- Incident response outline, vulnerability disclosure, security testing plan (SAST, DAST, dependency scanning, pen test timing)
- PCI scope analysis (target the lowest scope; mark as REQUIRES CONFIRMATION)
- Security acceptance criteria per phase

### 5.7 `06-infrastructure-architecture.md`
- Environments: local, CI, staging, production (parity, data policy, secrets policy)
- Deployment topology options (e.g., single-region managed vs VM-based Docker) with cost, complexity, data-residency and vendor lock-in trade-offs; recommend one with ADR
- Container/Docker strategy, Nginx role, TLS, WAF, CDN, object storage, queue/worker approach
- CI/CD pipeline design: stages, gates (lint, type-check, unit, integration, concurrency, migration, security scans), release and rollback strategy, migration safety
- Backup and recovery: RPO/RTO targets (propose, mark for owner approval), backup schedule, restore test procedure, disaster recovery scenarios
- Monitoring, alerting, SLOs; path to **99.9% monthly availability** after stabilization (what it requires and what it excludes)
- Capacity and load planning for a major on-sale event (spike traffic, queueing/waiting-room approach), with measurable targets for load tests
- Cost model skeleton (to be filled with real quotes; mark estimates as estimates)
- Project account and ownership plan: list every **project account** to be created (cloud, domains, DNS, Git hosting, Apple Developer, Google Play, platform-level accounts with payment providers, email provider, monitoring, error tracking, analytics) and confirm each is held **by BAYA eSIM LLC** with named owner, recovery contacts and MFA. Mark current status as UNVERIFIED unless evidence exists. This plan covers project accounts only. Platform user accounts (customers, independent organizers, employees) are specified in the security architecture account taxonomy.
- Partner and vendor onboarding: how third-party vendors and partners are evaluated, contracted and connected without compromising BAYA eSIM LLC control (least-privilege access, scoped API keys, DPA/contract requirements marked REQUIRES CONFIRMATION)

### 5.8 `07-payments-and-financial-reconciliation.md`
- Money flow diagrams for: ticket purchase, commission, organizer share, refund, chargeback, payout
- Provider evaluation: Stripe, Stripe Connect, local providers per primary market (BiH, HR, RS), cards, Apple Pay / Google Pay. For each: capabilities, country eligibility, marketplace/payout suitability, approval requirements, fees (UNVERIFIED unless sourced), integration complexity. **Do not assume an existing Stripe account authorizes marketplace ticketing or third-party organizer payouts.**
- **Provider approval register:** a table of every payment provider, bank or wallet partner considered (provider, country, capability needed, approval required, who applies, application status, evidence, blocking phase, fallback). Status is **UNRESOLVED / UNVERIFIED** unless written evidence exists in the repository. Never mark an approval as granted without evidence.
- Recommended Phase 1 approach: **sandbox/test-mode only**, with the provider interface abstracted behind a port so providers can be swapped per country
- Ledger design: double-entry or equivalent, accounts (platform revenue, organizer payable, provider clearing, fees, taxes, refunds), append-only rules, idempotency
- Separation of platform revenue and organizer funds
- Reconciliation process: daily provider report matching, discrepancy handling, state machine for payments, refunds, settlements and payouts
- Payout authorization workflow and controls (separation of duties, limits, holds)
- Tax/VAT/invoicing handling as configuration (REQUIRES CONFIRMATION)
- Fee and commission model as data; default test assumptions: 4.9% standard, 3.9% high volume, enterprise negotiated (all admin-configurable, never constants)
- Go-live gate checklist for real money (provider written approval, legal sign-off, compliance review, pen test, reconciliation dry runs, owner written authorization)

### 5.9 `08-legal-and-regional-dependencies.md`
Register of legal/regulatory/compliance dependencies per primary market and for expansion markets at a high level. Topics: company/contract structure with organizers, consumer protection and refund rights, ticket resale rules, VAT and invoicing, payment institution/e-money questions for holding organizer funds, data protection (GDPR and local equivalents), cookies/consent, marketing consent, accessibility requirements, app store policies, terms of service, privacy policy, organizer agreement, IP and contractor agreements (transfer of IP to BAYA eSIM LLC, source code access, confidentiality, credential handover). For each: why it matters, who must decide (owner / counsel / provider), blocking phase, status UNVERIFIED. **No legal conclusions.**

### 5.10 `09-multi-country-configuration.md`
Configuration model for countries, cities, languages, currencies, tax rules, fees, commissions, payment methods, payout rules, legal text versions, category sets, and feature flags per country. Include a worked example for BiH, HR and RS (marked as illustrative, requiring confirmation), the i18n strategy (including Serbian Latin/Cyrillic), formatting rules, and the process to add a new country with a checklist.

### 5.11 ADRs (`docs/adr/ADR-NNNN-title.md`)
Each ADR: Status (Proposed), Context, Decision, Alternatives considered, Consequences, Risks, Verification, Owner decision needed (yes/no). Minimum set:

1. Modular monolith vs microservices
2. Backend framework and API style (FastAPI, REST/OpenAPI)
3. Database and system of record (PostgreSQL), role of Redis
4. Inventory and seat concurrency strategy
5. ID strategy
6. Money representation and ledger design
7. Payment provider abstraction and Phase 1 sandbox-only policy
8. QR token format, signing and offline validation policy
9. Authentication and session strategy, MFA scope
10. Authorization model and organizer tenancy
11. Web architecture (SSR/SEO, monorepo layout, UI kit, i18n)
12. Mobile architecture (React Native, code sharing, scanner offline storage)
13. Search and discovery approach for Phase 1
14. Background jobs and scheduling
15. Infrastructure and hosting topology
16. Environments, CI/CD and release strategy
17. Observability and audit logging
18. Media storage and CDN
19. Multi-country configuration and localization
20. Recommendation engine: rule-based first, ML-ready interface
21. Notification and consent model
22. Backup, recovery and data retention
23. Repository ownership, project accounts and IP control under BAYA eSIM LLC, and partner/vendor integration policy (portability and exit paths, not avoidance)
24. User account model: customers, independent organizers and their team members, scanner staff and BAYA eSIM LLC employees/admins (creation, verification, tenancy, MFA, suspension)

Add more ADRs where you find real decisions. Do not pad.

### 5.12 `10-roadmap-and-acceptance.md`
See section 6.

### 5.13 `11-risk-register.md`
Table: ID, risk, category (technical, legal, financial, security, operational, delivery), likelihood, impact, mitigation, owner, trigger, status. Include at minimum: overselling under load, payment-provider approval delay/denial, funds-holding regulation, offline scanning abuse, QR sharing, bot-driven on-sales, GDPR/consent gaps, scope creep, solo-operator bus factor, key/account ownership gaps, contractor IP gaps, third-party outage during on-sale, vendor or provider lock-in and unfavorable partner terms, multi-currency/tax errors, translation quality, app store rejection.

### 5.14 `12-open-questions-for-owner.md`
Prioritized list (blocking vs non-blocking) of decisions only the owner can make, each with your recommended default and the consequence of not deciding.

### 5.15 `13-phase-0-report.md`
Final report in the format of section 8.

---

## 6. Roadmap and acceptance criteria requirements

For **Phase 1 through Phase 4**, define sub-phases small enough to be reviewed and approved individually. Phase 1 must **not** be one large step. Propose a sequence such as the following, and justify any change:

| Sub-phase | Candidate scope |
|---|---|
| 1.1 | Repository foundation, CI, environments, database baseline, migrations, auth, RBAC, audit log |
| 1.2 | Catalog (countries, cities, venues, categories), organizer onboarding, events CRUD |
| 1.3 | Ticket types, inventory, reservations, atomic purchase core, concurrency tests |
| 1.4 | Orders, payment provider port, **sandbox** integration, webhooks, ledger, refunds |
| 1.5 | Tickets, secure QR, online scan validation, single-use enforcement |
| 1.6 | Public web: home, discover, event details, checkout, My Tickets |
| 1.7 | Organizer portal essentials: dashboard, event creation flow, sales, team roles |
| 1.8 | Admin Control Center essentials: moderation, users, orders, refunds, commissions, audit log |
| 1.9 | Hardening: security tests, load test, backup/restore drill, deployment guide, MVP acceptance |

For **every sub-phase and phase**, specify:

1. **Scope** (in) and **Non-scope** (out)
2. **Dependencies** and **blocking owner decisions**
3. **Deliverables**
4. **Measurable acceptance criteria** (testable, with numbers where possible), for example:
   - "100 parallel purchase requests against 10 remaining tickets yield exactly 10 successful orders and 0 oversells; repeated 50 times"
   - "Replaying the same payment webhook 20 times produces exactly one payment record and one ticket set"
   - "Two devices scanning the same QR within 50 ms produce exactly one VALID and one USED"
   - "Reservation expiry releases inventory within the configured window, idempotently"
   - "Migrations run up and down on empty and previous-version databases"
   - "Backup restored into a clean environment passes a verification script"
   - "No Critical or High open security findings at phase close"
5. **Required tests** (unit, integration, concurrency, security, migration, e2e)
6. **Security criteria**
7. **Documentation criteria**
8. **Evidence required in the phase report**
9. **Go/No-Go conditions** for the owner

Also define:
- A global **Definition of Done** for any feature
- A **Definition of Ready** before a sub-phase starts
- The **MVP launch gate**: conditions that must be true before any real sale (provider approval, legal documents, support process, monitoring, backups tested, incident process)
- A **live-payments gate** separate from the MVP gate
- Estimated effort ranges per sub-phase for a small team or solo operator with AI assistance, clearly marked as estimates and with stated assumptions

Late phases (2, 3, 4) may be at lower detail, but each still needs measurable acceptance criteria.

---

## 7. Quality bar for the documents

- Specific, not generic. Name tables, endpoints, states, thresholds.
- Every recommendation traces to a reason and, where relevant, an ADR.
- Distinguish **Decided (proposed)**, **Open**, **UNVERIFIED** and **REQUIRES CONFIRMATION**.
- No marketing language. No invented facts about providers, laws, prices or capabilities. If you cite a fact from memory, mark it UNVERIFIED.
- No fake data presented as real.
- Keep documents navigable: table of contents, consistent headings, cross-references between documents and ADRs.
- Mermaid diagrams must be syntactically valid.
- Be internally consistent (table names, status names, role names identical across documents).
- Do not claim you ran anything you did not run.

---

## 8. Final report format (`13-phase-0-report.md` and your last message)

```
## Report: Phase 0 — Audit and Architecture
### Summary (3–5 lines)
### Environment findings (key facts only)
### Reuse findings
### Documents delivered (path + one-line description)
### ADRs delivered (list, status)
### Key architectural decisions proposed
### Done and tested
### Done, not tested
### Partial
### Not started
### Blocked (and by whom/what)
### UNVERIFIED items (count and top 10)
### REQUIRES CONFIRMATION items (legal / provider / tax)
### Security findings (severity, status)
### Top risks (top 10)
### Roadmap summary (sub-phases and gates)
### Owner decisions required (prioritized)
### Confirmation of constraints
- No production code written: yes/no
- No existing files modified: yes/no (list any new files created)
- No installs/starts/stops performed: yes/no
### Proposed next step (do not start it)
### STOP — awaiting owner approval of Phase 0
```

If any constraint was violated, say so plainly in the confirmation section.

---

## 9. Ownership statement to include in the documents

Include this statement, adapted as needed, in `02-system-architecture.md` and `07-payments-and-financial-reconciliation.md`:

> BALKAN EVENTS is a commercial brand and product of BAYA eSIM LLC, the sole legal owner of the project and of all project intellectual property. All source code, infrastructure, domains, cloud and developer accounts, platform-level vendor and provider accounts, API keys, design files, databases and documentation are owned or controlled by BAYA eSIM LLC. No project component may be created under personal or third-party ownership. The platform integrates and works with independent event organizers, payment providers, banks, technology vendors, Apple, Google and other legitimate business partners, and independent organizers, employees and customers create their own authorized user accounts within the platform. Ownership of the project does not restrict these integrations or partnerships.

---

## 10. STOP condition

When all deliverables are complete and self-reviewed:

1. Output the Phase 0 report.
2. State: **"Phase 0 complete. I have not started Phase 1. Awaiting your review and explicit written approval of Phase 0 deliverables before proceeding."**
3. **Do not** begin scaffolding, installing, coding or planning Phase 1 implementation details beyond what is in the roadmap document.
4. If the owner replies with comments, update **only** the Phase 0 documents and wait again.
5. Phase 1.1 may begin only after the owner explicitly writes approval naming Phase 0 and the sub-phase to start.

---

## 11. Start now

Begin with **Step A — Environment inspection (read-only)**. Report findings, then continue through Steps B–F in order, and stop at the end of Phase 0.

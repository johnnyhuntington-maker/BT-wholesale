# BT Nexus RBAC — Intelligence Reference

> Living document. Add new intel at the bottom of each section or create new sections as needed.
> Last updated: 2026-07-20 (refreshed with NaaS archetype research, Jason briefing, Zoya transcript)

---

## 1. Platform Overview

**Project Nexus** is a unified digital portal replacing BT Wholesale's fragmented legacy estate with a single self-serve portal for all partner tiers.

**Legacy portals being replaced:**
- **My BT Wholesale / Business Zone (BZ)** — ordering and management for WHC, full product range
- **VEL / Business Portal** — end-user and in-life management (SSO'd from BZ)
- **Hub / Partner Plus** (partners.btwholesale.com) — covers Broadband One, WHC Express, Complete Switch; has user management
- **SAF** — Service Assurance / Fault Diagnostics

**DV4B (Digital Voice for Business)** is Priority 1 for migration. Broadband stays in existing Hub (jump link only — not migrated initially). DV4B scope is Centrex only — SIPT and mixed sites are out.

**Target outcomes for Nexus:** NPS +33 (from +12 today) / 90% strategic product adoption in 24 months / 40% faster time-to-market / 20% cost-to-serve reduction.

**Product migration roadmap (from scoping call, John Daffern, 1 July 2026):**
| Product | Migration | Priority |
|---|---|---|
| WHC / WHC Express | → DV4B | Priority 1 — order journey paused pending DV4B structure input |
| DIA / Ethernet | → UK Fabric | Evaluating — team assessing legacy API stepping-stone approach |
| L3 BB (BB1) / L2 BB (WBMC) | → Strategic BB | Later — already on Hub, jump link only |
| PDPL | Retained as-is | Later |

**Core portal services reused from Hub:** user registration (existing login/account setup) and RBAC (permission model — primary design focus for Phase 1). Login and RBAC built once and shared across the portal.

**VEL redesign is out of scope for Nexus** — a separate team owns it. Nexus enables SSO access to VEL but does not replace it.

---

## 2. Organisation Hierarchy

### The 5-tier tree

```
BT Wholesale (root)
└── Reseller (Direct / Super Reseller)
    ├── Sub-Reseller
    ├── Child Reseller
    └── Dealer
```

**BT Wholesale only has a direct commercial relationship with Resellers (Direct/Super).** Sub-Resellers, Child Resellers, and Dealers operate under their parent org's contract.

| Org type | Description |
|---|---|
| Reseller | Direct contract with BT Wholesale. Full downstream control. |
| Sub-Reseller | No direct BT contract. Sells the reseller's services under the reseller's relationship. |
| Child Reseller | Broad downstream access but with selected restrictions (key one: cannot raise support tickets). |
| Dealer | Most restricted. Inherits specific services and parent's branding only. |

**Example org tree used in prototype:**
- Northgate Telecom (Reseller)
  - Metro Connect (Sub-Reseller)
  - Halo Networks (Child Reseller)
  - Riverside Comms (Sub-Reseller)
  - Apex Telecom (Dealer)
- Beacon Wholesale Ltd (Reseller)

---

## 3. Org-Type Capability Matrix

Source: Paul Enright's 8 June session (Mural), confirmed by Zoya, implemented in prototype.

| Capability | Reseller | Sub-Reseller | Child Reseller | Dealer |
|---|:---:|:---:|:---:|:---:|
| Portal access | ✓ | ✓ | ✓ | ✓ |
| Place & manage orders | ✓ | ✓ | ✓ | partial |
| Manage own users | ✓ | partial | ✓ | ✗ |
| Create child organisations | ✓ | ✗ | ✓ | ✗ |
| Choose exposed services | ✓ | ✓ | ✓ | partial |
| Custom branding | ✓ | ✓ | ✓ | ✓ |
| Receive customer KCIs | ✓ | ✓ | ✓ | ✗ |
| Business Zone access | ✓ | ✗ | ✓ | ✗ |
| Hardware ordering | ✓ | ✗ | ✓ | ✗ |
| FMS / Empirix access | ✓ | ✗ | ✓ | ✗ |
| Raise support tickets | ✓ | ✗ | partial | ✗ |
| View BT billing | ✓ | ✗ | partial | ✗ |
| Manage entitlements | ✓ | ✗ | partial | ✗ |

**Critical rules:**
- Child Reseller **cannot raise support tickets** — must go via Super Reseller parent
- Sub-Resellers and Dealers cannot raise support tickets at all
- Only Direct/Super Resellers have a direct relationship with BT for support escalation
- **Design approach: build for Direct Reseller at max privilege first, then subtract downward** per tier

---

## 4. User Roles

### Reseller-side roles (7)

| Key | Label | Description |
|---|---|---|
| admin | Administrator | Full control — org settings, users, roles, entitlements, billing, support, API keys |
| orderManager | Order Manager | Places and manages product orders and faults |
| billingManager | Billing Manager | Manages invoices and billing reports |
| support | Support Agent | Handles faults and support tickets |
| reporting | Reporting Analyst | Read-only dashboards and reports |
| readonly | Read-only User | Can view but never change anything |
| apiDev | API Developer | API/sandbox access and key management |

### BT Wholesale-side roles (5)

| Key | Label | Description | Users (prototype) |
|---|---|---|:---:|
| btAdmin | Platform Administrator | Full platform config, reseller setup, network-wide access rules | 3 |
| btAccountMgr | Account Manager | Manages reseller relationships, product entitlements, downstream org setup | 6 |
| btBilling | Billing Administrator | Wholesale invoicing, billing reports, financial reconciliation across the network | 2 |
| btSupport | Network Support | Fault escalations and technical support from reseller orgs | 5 |
| btAnalyst | Reporting Analyst | Read-only — platform-wide performance data, usage, network dashboards | 4 |

**Note:** Deepa (product owner) confirmed as of July 2026 that roles are "not yet formally defined" on the product side. Neil's prototype roles are ahead of product — there may be a gap. PRD is source of truth when published.

---

## 5. Role-Permission Matrix (9 areas × 7 reseller roles)

Legend: ✓ = full, ~ = partial, ✗ = none

| Permission area | Admin | Order Mgr | Billing Mgr | Support | Reporting | Read-only | API Dev |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Organisation management | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| User administration | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Product management | ✓ | ~ | ~ | ~ | ~ | ~ | ~ |
| Operations & orders | ✓ | ✓ | ~ | ~ | ~ | ~ | ~ |
| Fault management | ✓ | ~ | ✗ | ✓ | ✗ | ~ | ✗ |
| Billing & invoices | ✓ | ✗ | ✓ | ✗ | ~ | ~ | ✗ |
| Reporting | ✓ | ~ | ✓ | ~ | ✓ | ~ | ✗ |
| Support tickets | ✓ | ~ | ✗ | ✓ | ✗ | ~ | ✗ |
| API access | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

**Key observations:**
- Organisation management and User administration are **Admin-only**
- API access is **Admin + API Developer only**
- Fault management domain: Support Agent (full) + Admin (full) + Order Manager (partial)

---

## 6. All 8 Personas (full list from Jason Grant briefing)

The full persona set extends beyond the 3 prototype views:

| # | Persona | Notes |
|---|---|---|
| 1 | Reseller Admin | Full downstream control |
| 2 | Reseller User | Scoped to assigned role |
| 3 | Sub-Reseller Admin | Restricted vs Reseller Admin |
| 4 | Sub-Reseller User | Scoped to assigned role |
| 5 | BT Internal Admin | Platform-wide config |
| 6 | BT Account Manager / Support | Reseller relationship management |
| 7 | API Supplier | Supplies capability via API |
| 8 | API Consumer / Partner Developer | Builds on top of BT APIs |

Personas 7 and 8 relate to the API Portal track (Matthew Lindley, API experience product owner). The prototype currently covers personas 1, 5, and 2 via the three Switch View modes.

## 6b. Access Personas (3 views in prototype)

### BT Wholesale Administrator
- Sees: Platform-wide view — full reseller network, all orgs, all users, all entitlements
- Can: Create/manage reseller orgs; assign products and entitlements to resellers; set up reseller admins; define platform-wide access rules
- Cannot: Carry out a reseller's day-to-day order management
- Prototype persona: Alex Morgan

### Reseller Administrator
- Sees: Their own org + all downstream orgs (Sub, Child, Dealer)
- Can: Create downstream orgs; invite team members and assign roles; control what downstream orgs can access
- Cannot: Access products not granted by BT; change BT platform-level settings
- Prototype persona: Sarah Whitfield, Northgate Telecom

### Standard User
- Sees: Their own tools only, scoped to their assigned role
- Can: Access portal and assigned tools; place orders / view reports where role permits
- Cannot: Create or manage orgs; invite or manage users; change any roles
- Prototype persona: James Okafor, Northgate Telecom (Order Manager)

---

## 7. Product Entitlements

**Products (4):**
- Broadband
- Digital Voice for Business (DV4B) — Priority 1 for Nexus
- Strategic Broadband
- UK Fabric (Ethernet)

**Services (6):**
- Hardware ordering
- Customer KCIs
- Business Zone
- FMS / Empirix
- Support tickets
- Custom branding

**Entitlement inheritance by org type:**
- Reseller: all entitlements
- Sub-Reseller: products only + KCI + Branding
- Child Reseller: everything except Support tickets
- Dealer: products only + Branding

---

## 8. Current As-Is Model (Hub / Partner Plus)

Source: Hub Manage User walkthrough (Vijitha KM, 24 June 2026)

**Current roles in Hub (2, not 7):**
- Admin User
- Regular User

**Current permission checkboxes (4):**
- Billing
- Ordering
- Raising faults
- Service Now Tools (nested under Raising faults)

**User statuses:** Active / Pending invite / Deactivated

**Key journey steps:**
1. User icon → Account Management → Manage Users
2. Add User (name, email, phone, profile type, permissions)
3. Per-user actions: Set permissions / Deactivate / Remove / Resend invite

**Deactivate vs Remove:**
- Deactivate = reversible (user moves to deactivated list)
- Remove = permanent (requires account manager to undo)

**Invite flow:** Registration email sent on user creation. User sets own password via link. Status = "Pending invite" until completed.

**Add Products is a separate flow** — product access is managed independently of user roles in Hub.

---

## 9. Design Decisions and Constraints

1. **Design for Direct Reseller first** — North Star at max privilege, subtract downward for Child/Sub/Dealer. Never design for most restricted first.
2. **Child Reseller = Direct Reseller minus support tickets** — this is the primary differentiator.
3. **PRD is source of truth** — Mural notes may be stale.
4. **Customer establishment is likely out of scope** for the strategic portal (Service Designer territory).
5. **VEL redesign is a separate team** — Nexus just enables SSO access to VEL.
6. **Whether roles are BT-fixed or reseller-configurable** is a key open design decision — not yet resolved.
7. Whether Dealer needs portal login at all (may be just an entitlement recipient) — open question.

---

## 9b. As-Is Ordering Journey (BZ — WHC new order)

Source: Nigel Walton (Wholesale Voice Consultant), 26 May 2026. Fully self-served, ~10–12 minutes.

**Steps:** BZ Dashboard → "Place a new order" → select account → New products tab → select WHC → fill site address → company admin details → Billing (review/change billing account + order contact) → Activation (select user + date) → Review summary → Place order → KCI list generated.

**Full order structure:** Company → Numbers → Site → Users → Billing → Activation. Bulk user upload via Excel template.

## 9c. As-Is In-Life Management (modify existing order)

Source: Paul Enright, 11 June 2026.

BZ Dashboard → Inventory & Reports → Inventory tab → click service type → drill down: site → location → users → "Add another item" → options: Centrex user (full flow) / CPE additional / site.

**CPE additional pain point:** "You have not added this IP phone to your order. Click cancel then Add to add it" — confusing UX, a known friction point.

**CDR/reporting gap:** CDRs sent every 15 mins to FTP, rated calls every 4 hours — no in-portal reporting currently.

## 9d. VEL / Business Portal Navigation Structure

Source: Zoya Azar session, 13 July 2026.

**Access route:** BZ → Inventory → click service → Quick view → "Configure on BP" → CUG selection modal → SSO into VEL. No direct login to VEL — must go via BZ SSO. End customers CAN access VEL directly (unlike resellers).

**Navigation tiers:**
- Primary: Companies / Service provider / Notices / Numbers / Add companies
- Secondary (company selected): Company tab / Site tab / Groups / Users
- Tertiary (company level): Dashboard / Features / Devices / Numbers / Calls / Activity / Profile
- Tertiary (user level): Dashboard / Calls / Features / Calling rules / Incoming calls / Call policy / Contacts / Devices / Applications / Phone services / Schedules / Profile

**Key pain point:** Everything looks the same at every level — no visual indicators of whether you're at company, site, or user level. Dashboard and Company share the same view. (Zoya Azar, 13 July 2026.)

## 9e. WHC Customer Onboarding — CRF Process

Source: Mohammed Zubairulla (BTW Customer Service Advisor), 26 June 2026. SLA: 12 working days. 11 spreadsheet tabs, 23+ systems.

**Stakeholders:** Customer (fills CRF) → Sales Specialist (submits) → Establishment Team (validates, sets up VEL, raises SMB requests) → SMVP Assurance Team (creates VEL account) → Training Team ITEL (delivers offline training) → Billing/One C Bill.

**Flow:** Deal signed → CRF submitted → validation → VEL portal setup (neutral = BT standard URL; branded = customer buys SSL, returned to team for mapping) → account creation + call recording (Toolring/SMB) → training → customer live.

**Design decision:** Customer establishment is likely out of scope for Strategic Portal — Service Designer territory.

## 10. Key People

| Person | Role | Relevance |
|---|---|---|
| Neil Ballinger | Line manager / UX Lead | Built the original RBAC prototype; owns Experience Map in Figma; sets design direction |
| Deepa Packirisamy | Service Designer (also described as portal product owner) | As-is journey mapping, CRF swim lane; confirmed roles "not yet formally defined" as of July 2026 |
| Zoya Azar | Designer (NCB R) | Owns RBAC wireframes, login screens, dashboard; built Mural intelligence maps from recordings |
| John Daffern | Cluster lead | Shared migration diagram on scoping call; DV4B = Priority 1 confirmed |
| Matthew Lindley | API experience product owner | API portal track |
| Rebecca Cornwell | Programme lead | New; being introduced to wider stakeholders by 20 Jul 2026 |
| Saurabh Upadhyay | Technical/architecture lead | Owns technical RBAC implementation |
| Gail Ash | Product — Customer Hierarchy & Org Model | Defines org hierarchy and rules across all products |
| Mohammed Zubairulla | WHC establishment agent (SME) | As-is onboarding process subject matter expert |
| Jason Grant | Service Designer | New starter (onboarded July 2026); remit TBD — separate swim lane from Product Design |
| Nigel Walton | Wholesale Voice Consultant | Documented BZ order journey (26 May 2026) |
| Paul Enright | Wholesale Voice Consultant | Documented reseller hierarchy (8 June) and in-life/CPE journey (11 June) |
| Vijitha KM | BT Wholesale | Demonstrated Hub user management walkthrough |
| Paul Enright | Mural contributor | Created the org-type capability table (8 June session) |

---

## 11. Delivery Epics (Customer Onboarding & RBAC Framework)

6 features under this epic:

1. **Customer Hierarchy & Organisation Model** — Gail Ash (product) + Saurabh (technical). Wireframes: Zoya.
2. **RBAC Framework** — Permission catalogue, permission sets, custom role model, role assignment rules, hierarchy-based access. Design screens: Zoya.
3. **Cross-Portal Role Mapping** — Map equivalent roles across Hub, DV4B, Business Zone. Agree target role model.
4. **Identity & SSO Strategy** — separate owner.
5. **Customer Establishment** — likely out of scope for strategic portal.
6. **Inventory existing portal roles** across Hub, DV4B, Business Zone.

---

## 12. Open Questions (as of 2026-07-20)

- Whether roles are BT-fixed or reseller-configurable
- RL2C and Group CLI access rules for Direct/Child — not confirmed
- Whether Dealer is a portal user or just an entitlement recipient
- How the existing BZ/Hub RBAC model carries over vs redesign from scratch
- Per-persona role differentiation: does "Administrator" mean different things for Direct vs Child Reseller?
- Architecture decision: new SPA vs existing app reuse — still open

---

## 14. UK Fabric / NaaS — Wholesale Archetype Research

Source: STL Partners, commissioned by BT, June 2026. Workstream 3 of the NaaS customer needs programme. 6 wholesale interviews completed (Sales Director/Wholesaler, Head of Commercial/MSP, Product Leader/Wholesaler, Senior PM/Carrier, Commercial & Strategy PM/Aggregator, Head of Product/Carrier) + 2 scheduled.

**Why wholesale is treated separately from enterprise:**
Enterprise consumes UK Fabric as end-user. Wholesale uses UK Fabric to serve, support, and sell to its own customers. Enterprise archetypes are needs-based (connectivity challenges, digital maturity). Wholesale archetypes are company-type based (position in value chain, commercial model, relationship to end customers).

### Two provisional wholesale archetypes

**Infrastructure-led (e.g. Carriers)**
- Own and operate fibre/transport infrastructure — connectivity is their core business
- Create value through network reach, coverage, connectivity capability
- Sell directly and through partners; compete with AND buy from BT Wholesale
- Core priority: expand network reach and bring new products to market
- Main pain point: manual processes and fragmented systems slow service delivery
- What they want from NaaS: programmable, modular connectivity building blocks that extend their own network
- Key NaaS priorities: Modularity / API-first control / Automated lifecycle management

**Customer-led (e.g. MSPs, Aggregators, Resellers)**
- Aggregate services from multiple providers into a single customer proposition
- Create value through customer relationships, solution design, commercial reach
- Primarily customers of BT Wholesale, not direct competitors
- Core priority: simplify connectivity for their customers
- Main pain point: supplier friction slows quoting, provisioning, customer communication
- What they want from NaaS: simple, governed buying and management experience across suppliers
- Key NaaS priorities: Single pane of glass / Governance-first / Supplier simplification

### What wholesalers want from upstream suppliers (shared needs)
1. Automated lifecycle management — reduce manual effort across quoting, provisioning, MACDs, fault handling
2. Accurate delivery visibility — reliable timelines + transparent order tracking (reliability > speed)
3. Standardised API integration — consistent APIs (TM Forum standard), connecting supplier capability into their own portals
4. Operational control and transparency — visibility of network performance, usage, service status across fragmented supplier estates
5. Commercial and billing visibility — clearer charging, consumption, billing — reduce reconciliation effort and customer disputes

### What they seek to deliver downstream (what they need to offer their own customers)
1. Meet promised timelines — realistic expectations, proactive KCIs throughout lifecycle
2. Single pane of glass — unified view of services, orders, faults, performance regardless of underlying suppliers
3. Simplify service consumption — customers consume connectivity without dealing with upstream supplier complexity
4. Consistent customer experience — same operational experience across different networks/technologies/locations
5. Greater customer control — faster changes, improved visibility, self-service with governance and audit trails

### 7 NaaS capability attributes — priority by archetype

| Attribute | Infrastructure-led | Customer-led |
|---|---|---|
| Observable | Network performance visibility for day-to-day ops | Single view across suppliers/services/orders for customer management |
| Flexible | Generally secondary — sometimes seen as structural threat to wholesale margins | Open to consumption-based models; indifferent as limited customer demand evidence |
| Modular | High — want to build differentiated propositions from modular components | Prefer integrated solutions and ability to package, but not core |
| Manageable | Want self-service/automation embedded into their own products and passed to customers | Strong desire to manage supplier services through portals and lifecycle tools |
| On-Demand | Fundamental — rapid provisioning, service changes, capacity adjustments | Faster provisioning attractive; dynamic bandwidth/frequent changes appear limited |
| Programmable | Strong — APIs, automation, integration into operational systems | Prefer API-enabled suppliers for automated quoting, pricing integration |
| Secure | Assumed baseline, rarely raised as differentiator | More prominent — governance and customer trust, especially in managed environments |

### Scale spectrum (important for portal design)
- **Smaller customers (long tail of revenue):** prefer portal-led self-service with standardised commercials
- **Larger customers (core of wholesale revenue):** prefer API-first integration plus face-to-face commercial engagement; greater emphasis on technical integration and commercial flexibility

**Implication for Nexus:** Portal self-service serves the long tail. API Portal serves larger, more technically mature partners. Both tracks matter — the nav additions (API Portal, Knowledge Hub) are directionally correct.

## 13. Source Sessions

- **Paul Enright Mural session (8 June 2026)** — org-type capability table
- **WHC Customer Establishment meeting (7 July 2026, 1h 13m)** — Mohammed Zubairulla walkthrough of BZ/WHC onboarding across 15+ manual systems
- **UAM screen recording (2:52)** — colleague walkthrough of Nexus UAM prototype across 3 personas
- **Hub Manage User Walkthrough** — `Hub- Manage User Walkthrough (1).mp4` — invite flow, registration email, user management
- **Zoya x Johnny Teams session (13 July 2026, 40m 21s)** — verbatim transcript; covers VEL nav structure, reseller hierarchy analogies ("teenager" / "7–8 year old"), in-life modify flow, CUG friction, SSO route, VEL pain points, design priorities for Johnny's RBAC work
- **Zoya Mural sessions (~30 min + ~40 min)** — intelligence-gathering Mural covering org hierarchy, capability table, RBAC approach
- **Jason Grant new starter briefing (14 July 2026)** — compiled by Johnny; covers full platform overview, current estate, 8 personas, ordering journey, in-life management, VEL nav, CRF onboarding process, migration roadmap, team + open questions
- **BT NaaS Wholesale Archetype Exploration (June 2026)** — STL Partners commissioned research; UK Fabric workstream 3; 6 wholesale interviews; defines Infrastructure-led vs Customer-led archetypes; 7 NaaS capability attributes; scale spectrum implications
- **WHC Business Zone Ordering Guide (Feb 2023, v27.0)** — Official BT Wholesale internal guide for WHC L2C ordering via Business Zone portal; covers Provide/Add/Modify/Cease journeys, admin role structure, CUG/MyAdmin permission model, Business Portal admin delegation

## 15. WHC Business Zone — Ordering Journey & Permission Model

**Source:** BT Wholesale internal guide v27.0 (Feb 2023). Covers the legacy Business Zone (BZ) portal that Nexus is replacing.

### Ordering journey structure (Provide order)

4-step linear wizard:
1. **Configuration** — multi-sub-step entry via left-hand nav panel (Company → Numbers → Site(s) → Broadband → Users). Site types: Centrex, SIPT (SIP Trunking), Mixed.
2. **Billing** — review billing account and address
3. **Activation** — set activation date/time
4. **Review** — confirm and submit

Same 4-step pattern applies to Add orders; Modify and Cease are 3-step variants.

**In-journey UX details (legacy reference):**
- Left Hand Navigation panel shows build trail with purple tick marks on completion
- Auto Save — saves to Saved status; deleted at 8pm same day unless saved after 8pm (then deleted 7am next day)
- Order line limit: 75 per order (SIPT/Mixed orders can add up to 100 Trunking Users on top)

### Admin role tiers (4-level hierarchy)

| Role | Scope |
|---|---|
| **CP Administrator** (Standard or Super Reseller) | Places and manages orders in Business Zone — the wholesale partner |
| **Company Administrator** | Manages a specific customer company (end-user admin) |
| **Site/Group Administrator** | Manages a specific site or call group within a company |
| **End User** | Uses the telephony service |

**Super Reseller** — a CP who resells through downstream sub-resellers. Sub-resellers/Dealers can be set up as separate Customer Groups. Super Reseller agents cannot raise fault tickets or escalations (that is blocked).

**My Admin user** — the BTW.com administrator who grants other users access to Business Zone. Multiple My Admin users can exist per CP account.

### Access grant flow (CP onboarding via MyAdmin)

1. User self-registers on btwholesale.com and requests "BT Wholesale Voice Products Ordering and Support System" access
2. CP Administrator receives email, goes to MyAdmin, takes ownership of the ESR, and adds applications
3. CP Admin assigns Business Zone roles from the available set (below)

### Business Zone roles (assigned per user in MyAdmin)

- **Order Management** (full or partial) — allows placing orders
- **Repair Management** (full or partial) — allows raising fault tickets
- **Escalations** — sub-role under Repair; not available to downstream resellers of Super Resellers
- **Standard User** — mandatory baseline for all users
- **View Alert PEW emails** — optional; allows viewing service alerts digitally

### WHC product-level permissions (CUG — Closed User Group)

Granular capabilities assigned per user in MyAdmin CUG:
- WHC Company / WHC New Number / WHC Ported Numbers / WHC Site
- WHC Broadband Complete (can be withheld if CP provides own connectivity)
- WHC Trunking User / WHC User
- Number Import Single-Line / Number Import Multi-Line

### Admin delegation toggle (set at order time, modifiable in-life)

**Business Portal admin rights** — controls what Company/Group Admins on VEL/Atreus can do:
- **Config only** (default) — Company/Group Admins can configure features only
- **Config & Reg** — additionally allows Company/Group Admins to Add, Modify, and Cease Users (delegated ordering rights)

### Key WHC terminology

| Term | Meaning |
|---|---|
| CP | Communications Provider — the reseller/partner ordering WHC from BT Wholesale |
| Company | The end-customer entity being provisioned on WHC |
| Centrex | Fully hosted site/user type (no on-site PBX) |
| SIPT | SIP Trunking site/user type |
| Mixed Site | Site combining Centrex and SIPT |
| L2C | Lead-to-Cash — the ordering/provisioning journey |
| T2R | Trouble-to-Resolve — the faulting/support journey |
| CUG | Closed User Group — permission grouping in MyAdmin controlling product access per user |
| MyAdmin | BTW's portal admin tool used to grant/manage user roles and access |
| VEL / VEL (New) | The end-customer Business Portal (replacing Atreus) where Company/Group Admins manage users |
| Configuration Portal | The end-customer-facing portal (Atreus or VEL) accessed via SSO |
| DDI | Direct Dial-In number allocated to a user |
| CPE | Customer Premises Equipment ordered as part of the journey |

### RBAC design implication

Business Zone has a clear **two-tier access delegation model**: BT Wholesale controls what a CP can do (via CUG/MyAdmin role assignment). The CP then controls what their end-customer admins can do (via the Config only vs Config & Reg toggle). This directly mirrors the RBAC hierarchy in Nexus — the prototype's BT Wholesale Admin → Reseller Admin → Standard User model maps cleanly to this legacy structure.
- **WHC Product Demo / BZ Order Journey** — full new order walkthrough for DV4B parity exercise

---

## 16. User Management Experience Map — Detailed Journey (Hub As-Is)

Source: Artifact `daa72772-50fb-403a-8876-6c0127169e6e` — "RBAC Experience Map — Nexus First Pass" (15 July 2026). Based on: Hub walkthrough Vijitha KM (24 Jun) · Deepa Packirisamy (15 Jul) · Paul Enright hierarchy session (8 Jun).

This section captures the step-by-step detail per persona and phase that goes beyond the high-level summary in Section 8.

---

### Phase 1 — Onboarding

**BT Wholesale Admin:**
- Provisions new reseller account (tenant) in Hub backend
- Establishes primary contact — this person becomes the first Company Admin with Admin User status
- System: Hub / Partner Plus backend provisioning
- **Gap:** Full onboarding process (CRF → establishment → training) lives separately from the portal — Deepa has a swim lane diagram of the end-to-end
- **Gap:** How BT controls which products and capabilities are available to a reseller org (org-level vs user-level) — not yet defined
- **Gap:** How the 4 org tiers (Direct / Child / Sub / Dealer) affect available permissions — subtraction logic not yet designed

**Company Admin:**
- Established as primary contact by BT during account onboarding
- Receives Hub credentials, logs in for the first time
- **Insight:** Primary contact = default Admin User. Multiple users can hold Admin User status on the same account, but only one is the primary contact — primary contact cannot self-remove

**Open questions — Phase 1:**
- What does the customer establishment journey look like in the strategic Nexus portal? Currently a 12-day, 23-system CRF process — scope for v1 not confirmed
- Is the Company Admin set up by BT, or does the reseller self-register? Not documented.

---

### Phase 2 — Add a User

**Company Admin:**
- Navigation path: User icon (top right) → Account Management → Manage Users tab
- Clicks "+ Add User" — right-side drawer panel slides in
- Fields: First name · Last name · Company email (becomes login username) · Phone number (required for fault raising) · Profile type · Permission checkboxes
- Clicks Save → registration email sent automatically to the new user's email
- System: Hub · Account Management · `/s/hub/account-management`
- **Insight:** Company email must be "registered with this account" and becomes the user's login username
- **Pain point:** Test environment showed many duplicate and orphaned test users — no apparent guard against adding the same email twice

**Regular User (receiving the invite):**
- Receives registration email at the address entered by Company Admin
- Clicks register link in email → taken to password set page
- Sets own password → account becomes active
- System: Registration email · Password set page · SAF (BT authentication layer)
- **Insight:** User is in "Pending invite" state (info icon in list) until email registration is completed — visible to Company Admin throughout

**Open questions — Phase 2:**
- "Email must be registered with this account" — what does pre-registration mean for a brand new user with no existing Hub presence?
- Full invite email design and password-set page UX not documented — registration flow for Nexus needs defining

---

### Phase 3 — Set Permissions

**Company Admin:**
- Selects user from list → clicks "Set permissions ›" in the detail panel (available at any time)
- Sets permission checkboxes independently: Billing / Ordering / Raising faults / No permissions needed
- Optional: enables "Service Now Tools" (nested under Raising faults) — grants unmoderated access to ServiceNow portal. Helper text explicitly warns of this.
- **Insight:** Permissions can be changed at any time — not locked after initial setup
- **Insight:** Admin Users: only "Set permissions" shown in detail panel (no Deactivate or Remove for self). Regular users: Set permissions + Deactivate + Remove all visible.

**Regular User:**
- Views own permissions as coloured chips in "Your profile" panel — Billing / Ordering / Raising faults displayed as tags
- Read-only: users can see their own permissions but cannot change them
- System: Hub · Your profile · `/s/your-profile`

**Open questions — Phase 3:**
- Permission model for Nexus — new design or inherit Hub's 4 checkboxes? No decision yet (Deepa, 15 Jul)
- User roles not yet named or defined — Hub has only Admin User / Regular User. Is that sufficient for Nexus?
- How org-type tier (Direct / Child / Sub / Dealer) restricts available permissions — the subtraction logic is the core RBAC design problem, not yet tackled

---

### Phase 4 — Day-to-Day Access

**Company Admin:**
- Monitors user list — search-and-detail panel layout (left column list, right detail panel)
- Resends invite for users still showing as pending (info icon in user list)
- System: Hub · Manage Users
- **Pain point:** No bulk user management — all actions are one user at a time

**Regular User:**
- Logs into Hub → accesses My apps from user icon dropdown
- Apps surfaced by permissions: WHC Business Portal · Reporting · Raise a fault · Mobile Manager · Learning · Events
- Places orders (Ordering permission) · raises faults (Raising faults) · views billing (Billing)
- System: Hub My apps · WHC Business Portal (VEL via SSO) · ServiceNow · Reporting
- **Pain point:** VEL (WHC Business Portal) accessed via SSO from Hub only — resellers lost direct VEL access ~2 years ago and must route through Hub each session
- **Gap:** Whether My apps visibility is driven by user permissions or by products enabled at org level — not confirmed
- **Gap:** RL2C access for Direct and Child Resellers — confirmed unknown (Paul Enright capability table)
- **Gap:** Group CLI access for Direct and Child Resellers — confirmed unknown
- **Gap:** FMS and Empirix access rules for lower tiers — Empirix shows end-customer usage data; scope of access per tier not confirmed

---

### Phase 5 — User Lifecycle

**BT Wholesale Admin:**
- Required to action primary contact changes on an account — not self-service for resellers
- **Gap:** Primary contact change process not documented — who initiates, what's the SLA?

**Company Admin:**
- **Deactivate:** Reversible. User moves to deactivated users page (`/s/deactivated-users`). Reactivate link appears there.
- **Remove:** Permanent disassociation from account. To re-add: must contact account manager — not self-service.
- **Pain point:** Remove is a self-service irreversible action — the confirmation modal warns of this, but the asymmetry (easy to remove, hard to undo) is a significant design risk worth addressing in Nexus
- **Insight:** Cannot deactivate or remove own account via UI — those action links are hidden for self

**Regular User:**
- Deactivated: loses access immediately. Remains in system under deactivated users — can be reactivated by Company Admin.
- Removed: disassociated from tenant entirely. Orders, invoices, audit logs remain on the account — data is not deleted.
- **Insight:** Account = tenant. Removing a user severs only the association — historical transactions and audit trail are preserved against the account

**Open questions — Phase 5:**
- Primary contact change process — who initiates, what's the SLA, is there a self-serve path in Nexus?
- Should Remove remain non-self-service in Nexus? The current "contact account manager to re-add" model is a clear friction point worth redesigning — could Nexus offer a 30-day soft-delete / restore window instead?

---

## 17. Product Requirements Document (PRD)

**Source:** `/Documents/BT Nexus/PRD/Nexus_Product_Requirements_Document.pdf` — 65 pages, "General" classification. No version or date stamped (placeholders `<date>` and `<issue>` unfilled — draft status confirmed).

**Last read into intel:** 2026-07-23

---

### 17.1 Programme Summary

> "Project Nexus will build a unified digital portal via an API-first platform for BT Wholesale partners, providing a single, coherent way to onboard, buy, manage and support strategic products."

**Success metrics (PRD-defined):**
- NPS: +12 → +33 (+20 points)
- 90% of strategic product adds within 24 months of launch
- 40% faster time-to-market for new products
- 20% cost-to-serve reduction
- 99.9% portal and API uptime

**API-first principle (verbatim):** "No business capability exists in the UI without it being driven by an API. Any API could be externalised at any time. We will use the same APIs as our customers."

---

### 17.2 In-Scope User Personas (PRD table)

| Persona | Org | Primary need |
|---|---|---|
| Reseller Admin | Wholesale Partner | Manage users/roles, onboard sub-resellers, full portal access |
| Reseller User | Wholesale Partner | Place/track orders, manage services, raise faults, diagnostics |
| Sub-Reseller Admin | Sub-Reseller | Manage own users, delegated admin, no commercial data (pricing/billing) |
| Sub-Reseller User | Sub-Reseller | Orders (if enabled), fault/appointment tracking, limited visibility |
| Internal BT Service Admin | BT Internal | Customer onboarding, account management, create Reseller Admin users |
| Internal BT User (AM/Support) | BT Internal | View/monitor orders and faults; assisted journeys via same portal APIs |
| API Consumer (Partner Dev) | Wholesale Partner | System-to-system API integration; sandbox + production |

**Key design note:** Sub-Reseller Admin explicitly has no commercial data access (pricing, billing) — this must be enforced via RBAC, not just hidden in UI.

---

### 17.3 Organisation Hierarchy (PRD model)

PRD describes a 3-tier hierarchy explicitly:
```
BT Wholesale
└── Reseller (Organisation)
    ├── Users
    ├── Products
    ├── Orders / Services
    └── Sub-Reseller (Organisation)
        ├── Users
        ├── Products
        └── Orders / Services
```

**Key PRD rules for hierarchy:**
- Sub-reseller inherits constraints from parent reseller (product eligibility, governance policies)
- Sub-reseller cannot exceed parent permissions
- Sub-reseller admin access restricted to own org and downstream only
- Parent reseller can have configurable visibility/control over sub-reseller
- Billing: parent billed by default; independent billing is configurable
- BT Internal users cannot register or onboard a new organisation — only manage existing ones

---

### 17.4 Identity & Authentication (PRD Section 9)

**SSO is the single authentication model** — partner, sub-reseller, and BT internal users all sign in once and access all authorised portals, journeys, and APIs without re-logging.

**Salesforce RBAC** confirmed as the chosen identity platform (see project memory — decided 2026-07-21). PRD notes: "Wholesale identity is NOT finalised — This impacts access, integrations, and user experience across everything. (MFA and wholesale identity strategy)" — this is an **open blocker** explicitly called out in the PRD.

---

### 17.5 RBAC Model (PRD Sections 10–12)

**Three-layer RBAC model:**
1. **Permission Sets** — granular capabilities selected from a predefined catalogue (e.g. Order Create, Fault Raise, Billing View). Grouped by capability, versioned, auditable.
2. **Roles** — named combinations of one or more permission sets. Roles cannot exceed organisational entitlement.
3. **Users** — assigned one or more roles. Role changes take effect immediately/near-real-time with no re-authentication.

**RBAC Enforcement rules (PRD):**
- Enforced consistently across portal UI, APIs, and backend services
- Same rules apply to assisted journeys (BT internal acting on behalf of partner) — internal users cannot bypass permissions
- All role/permission changes are audit-logged: who, what, when, outcome
- Unauthorised actions are blocked with a clear message

**Permission catalogue examples (PRD):** Order Create, Fault Raise, Billing View — grouped by capability. Full catalogue not specified in PRD; to be defined in detailed design.

**Open PRD question (verbatim):** "Do we need audit logs and access to them (screens or backend logs)?" — not yet resolved.

---

### 17.6 User Onboarding Flow (PRD Sections 4–8)

**Reseller establishment (BT Admin-initiated):**
- BT Admin creates organisation → unique org record created → downstream systems auto-provisioned (Identity, CUG, billing references)
- Multiple admin users can be created per org
- Admin roles can be scoped by: Product (DV4B, BBone) AND Journey (Order, Service Mgmt, Billing)
- RBAC controls access to features, data, and journeys from day one

**Sub-Reseller establishment (BT Admin-initiated):**
- Sub-reseller linked to parent reseller; inherits parent constraints
- Products/journeys enabled for sub-reseller must be equal to or subset of parent reseller's capabilities
- This constraint enforced across UI, APIs, and backend validation

**User self-serve onboarding (Reseller Admin-initiated):**
- Admin sends invitation email with registration link (expiry + resend supported)
- If user already exists in identity system, access linked (no duplicate identity created)
- Admin can: update roles, force password reset, disable access, remove access
- When access revoked: active sessions terminated AND API access revoked immediately

**BT Internal Users:**
- Authenticate via SSO
- Must explicitly select an organisation context before acting
- Access limited to organisations within their authorised scope
- All actions audit-logged with actor type (BT internal), org context, assisted flag

---

### 17.7 Product Enablement (PRD)

- BT Admin onboards strategic products (Broadband, Digital Voice) per org
- Product onboarding validates: pricing model configured, commercial agreement in place, prerequisites met
- Status tracked: Pending → In progress → Completed / Failed
- On success: relevant journeys/APIs enabled, product visible in portal
- API access is enabled based on product access AND role-based permissions (both must be true)
- All product enablement changes are audit-logged
- Sub-reseller product access must be equal to or a subset of parent reseller's enabled products — enforced everywhere

---

### 17.8 Supported Journeys (RBAC-relevant)

RBAC enforcement is called out explicitly in these journey areas:

| Journey | RBAC note |
|---|---|
| Organisation Hierarchy | Users can only view orgs within permitted hierarchy scope |
| Equipment/CPE ordering | Enabled for Reseller and Child Reseller; disabled for Sub-Reseller and Dealer |
| CPE remote operations | Governed by RBAC permissions |
| Billing | Role-based access enforced for all billing data; no direct billing calculation in portal |
| Service management | Modify permissions required; same APIs apply to assisted journeys |
| Fault management | Assisted faults clearly marked; all actions audit-logged |
| Inventory views | All restricted based on RBAC and hierarchy scope |
| Briefings | RBAC-controlled briefing repository |

**Final PRD note (verbatim, page 65):**
> "All platform actions and data access are governed by role-based permissions. Access is restricted based on: User role, Organisation hierarchy (reseller, sub-reseller, customer), Product and journey entitlements. RBAC enforcement applies consistently across: Portal (UI), APIs, Backend services. Users can only perform actions and view data within their authorised scope."

---

### 17.9 Non-Functional Requirements (RBAC-adjacent)

**Audit requirements:**
- Full audit trail: who, what, when, outcome (including previous and new values)
- Covers: orders, faults, billing interactions, API access, organisation/access changes
- Assisted journey actions separately flagged (actor type, org context, assisted flag)
- Audit records are immutable, searchable, filterable, accessible only to authorised roles

**Security:**
- All interactions comply with BT security guidelines
- Rate limits per API and consumer
- Data encrypted in transit and at rest
- Sensitive data masked/redacted in logs

---

### 17.10 DV4B Scope (Product context for prototype)

DV4B is Priority 1. Portal must support:
- Licence tiers: Essential, Enhanced, Extra — selectable at company level
- Hierarchy: Organisation → Site → User → Service
- Bulk user/service upload via spreadsheet
- Async order processing with status tracking
- Number selection per site/location
- CPE/equipment ordering → zero-touch provisioning
- Lifecycle: add, modify, cease at org/site/user/service level
- Policy controls: call restrictions, usage limits

**Org types and equipment ordering (PRD table):**
- Reseller: YES
- Child Reseller: YES
- Sub-Reseller: NO
- Dealer: NO
- Enforced via RBAC + organisation type (both UI hidden + backend validation)

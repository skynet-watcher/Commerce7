# Project brief — _(client or codename)_

_Copy this file to `docs/projects/YYYY-MM-DD-name.md` or a private doc and fill every section before deep implementation._

## 1. Outcome

- **One sentence:** What must exist when we’re done?
- **Success metric:** How will we know it works?

## 2. People & access

- **Commerce7 tenant(s):** sandbox vs production IDs / names
- **Who approves:** Name, role
- **ADC access:** Who can create/edit the app in App Development Center?
- **Secrets:** Where will client ID / secret live? (1Password, Vault, …)

## 3. Workflows (ordered)

For each workflow, list trigger → steps → data.

| # | Trigger | Steps (bullets) | Reads | Writes | Errors / edge cases |
|---|---------|-----------------|-------|--------|----------------------|
| 1 | | | | | |
| 2 | | | | | |

## 4. Commerce7 surfaces

- [ ] **Integration only** (no Admin UI)
- [ ] **App extension** — type: _____________ (see `developer/app-platform/app-extensions.md`)
- [ ] **Webhook-driven** — events: _____________
- [ ] **Scheduled / batch** — cadence: _____________

## 5. Non-functional

- **Timeline / milestones:** 
- **Compliance / PII:** 
- **Uptime / retries:** 
- **Environments:** dev / staging / prod URLs

## 6. Out of scope

- Explicitly list what we are **not** building.

## 7. Links

- Design / tickets: 
- Commerce7 docs used: (add after mapping — see `EXECUTION-PLAYBOOK.md`)

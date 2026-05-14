# Night-before / morning-of kickoff

Do these **before** or **as soon as** the project is assigned so you are not blocked on access or tools.

## Accounts & access

- [ ] **Commerce7 sandbox** (or client tenant) — login works; you know who grants **App Development Center** access.
- [ ] **GitHub** — push/pull to [skynet-watcher/Commerce7](https://github.com/skynet-watcher/Commerce7) (or whichever repo the client uses).
- [ ] **Secrets place** — where `COMMERCE7_CLIENT_ID` / `COMMERCE7_CLIENT_SECRET` will be stored (not in chat or committed files).

## Repo & docs

- [ ] **Refresh mirrored docs** (optional but quick):  
  `python3 -m pip install -r requirements-docs.txt && python3 scripts/fetch_docs.py`
- [ ] **Copy** [`PROJECT-BRIEF-TEMPLATE.md`](PROJECT-BRIEF-TEMPLATE.md) and start filling during the kickoff call.
- [ ] **If sandbox is blocked** — read **`docs/EXECUTION-PLAYBOOK.md`** §3 and **`HANDOFF.md`** *Progress without Commerce7 sandbox*; use mocks and non-C7 work until ADC access exists.
- [ ] **Read** [`HANDOFF.md`](../HANDOFF.md) for full developer onboarding.
- [ ] **Read** [`EXECUTION-PLAYBOOK.md`](EXECUTION-PLAYBOOK.md) once so the phases are fresh.

## Local machine

- [ ] **Node & pnpm** — Homebrew Node first on `PATH` (`export PATH="/usr/local/bin:$PATH"`), then `pnpm install`. See [`STACK.md`](STACK.md).
- [ ] **ngrok** — `ngrok version` (optional: `ngrok config add-authtoken …` from your ngrok dashboard).
- [ ] **`cp .env.example .env`** — set `PORT` / URLs when you know tunnel + ADC redirect.

## First hour when the project lands

1. Paste stakeholder answers into the project brief (§1–§3).
2. Run **§1–§2** of the execution playbook: map workflows → APIs / webhooks / extensions.
3. Create or open the app in ADC; set **only** the permissions you listed.
4. Get one **read** and one **write** working in sandbox before building UI.

## Quick links

- [docs README / index](README.md) — all mirrored Commerce7 guides
- [Authentication (mirrored)](developer/app-platform/authenticate-app.md)
- [Webhooks (mirrored)](developer/app-platform/webhooks.md)

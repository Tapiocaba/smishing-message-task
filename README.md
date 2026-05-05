# Can You Tell At A Glance? Lightweight Interface Defenses for SMS Phishing Repo

HCI research platform for studying smishing (SMS phishing) detection for CS 278 Project. Two web apps share this repo.

<div align="center">
  <figure>
    <img width="800" alt="prototype-sms-demo" src="https://github.com/user-attachments/assets/1eefdefc-645e-4f7b-84be-b3819610f239" /> 
    <br>
    <figcaption><em>Figure 1. Phone SMS practice round with features </em></figcaption>
  </figure>
</div>

<div align="center">
  <figure>
    <img width="800" alt="prototype-storybook" src="https://github.com/user-attachments/assets/eeca6c88-1fbc-4391-a7d5-cc7ca8f8ff16" />
    <br>
    <figcaption><em>Figure 2. Feature Storybook</em></figcaption>
  </figure>
</div>

## Abstract

SMS phishing ("SMiShing") remains a persistent threat, especially in a world where users often make quick decisions under time pressure while managing multiple conversations. Existing interventions focus on detection accuracy, spam filtering, or model-generated explanation, but less is known on how interface design decisions can help users make these rapid trust judgments in everyday messaging workflows. We present a series of low-level supports for SMS phishing detection — including sender identity cues, link risk annotations, category chips, notification-level spam labels, expandable risk context, expectedness prompts, and consolidated spam report/delete actions — all aimed to reduce friction while increasing transparency without adding mental load. We evaluate our approach with three participants in a web-based iPhone messaging simulator with spam messages under two attention conditions: a full-attention judgment task and a high-interruption shopping task. Preliminary results suggest that contextual explanations and supports that create a "quick action slow" best support user judgment on identifying risky messages.

## Apps

| App | Directory | Port | Purpose |
|---|---|---|---|
| **CSO Game** | `cso-game/` | 5173 | Text message classification with 4-button decisions (prototype) |
| **Realistic Phone** | `realistic-phone/` | 5174 | Phase 2 — iPhone SMS simulator |

Both apps are standalone React 18 + TypeScript + Vite 5 projects. 

## Quick Start

```bash
# CSO Game
cd cso-game && npm install && npm run dev

# Realistic Phone
cd realistic-phone && npm install && npm run dev
```

## Study Design for Realistic Phone

Within-subjects, two-block counterbalanced design. Each block uses the same message set in reversed order (Block 2 = Block 1 reversed) to mitigate practice effects. One feature flag is active per session; control sessions have no feature UI.

Messages are either **real** (legitimate SMS) or **fake** (phishing). Scoring:
- **Accurate**: phishing → report/delete, legit → keep
- **False negative**: phishing → keep (missed threat — the dangerous error)
- **False positive**: legit → report/delete

## Data
All participant data stays in `localStorage` under app-specific key prefixes:
- `cso_*` — CSO Game
- `rp_*` — Realistic Phone

Export happens at `/summary` as three JSON files per session.

## Researcher

1. Open `/researcher` to set participant ID, block order, and active feature
2. Hand device to participant — they start at `/`
3. After both blocks and questionnaire, export from `/summary`

See each app's `README.md` for full details.

## Storybook

Open `/admin` to see the storybook portal and see what individual supports look like.


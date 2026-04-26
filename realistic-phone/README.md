# realistic-phone

A realistic iPhone 16 SMS simulator for HCI research on smishing (SMS phishing) detection.

## Overview

This app presents real and fake SMS messages inside a realistic phone frame. Participants read each message and choose a response (Ignore / Open / Verify / Report). The app records decision accuracy and timing across two counterbalanced blocks.

## Quick Start

```bash
npm install
npm run dev    # http://localhost:5174
```

## Researcher Setup

1. Navigate to `/researcher` before each session
2. Set participant ID, block order, and active feature (or "none" for control)
3. Click **Save & Initialize**
4. Hand the device to the participant — start at `/`

## Study Flow

| Route | Screen |
|---|---|
| `/researcher` | Researcher config (not shown to participants) |
| `/` | Onboarding — explains the 4 decisions |
| `/practice` | 3 warm-up trials (unrecorded) |
| `/game` | Main 2-block study |
| `/break` | Rest screen between blocks |
| `/questionnaire` | Post-study Likert scales + open text |
| `/summary` | Accuracy display + JSON export |

## Adding Messages

Edit `src/data/messages.json`. Each message needs:

```json
{
  "id": "unique_id",
  "type": "real",
  "isPhishing": false,
  "category": "businessPromotion",
  "urlRisk": "safe",
  "sender": { "displayName": "T-Mobile", "phoneNumber": "456", "senderFormat": "shortCode", ... },
  "body": "Full message text",
  "threadPreamble": [],
  "warningReason": null,
  "officialURL": null,
  "hasImpersonationPattern": false,
  "blockAssignment": 1
}
```

- `blockAssignment: 1` — Block 1 only
- `blockAssignment: 2` — Block 2 only  
- `blockAssignment: "both"` — both blocks

## Data Export

After both blocks and the questionnaire, `/summary` exports 3 JSON files:
- `session_{ID}_{date}_trials.json` — per-trial results (40 rows)
- `session_{ID}_{date}_summary.json` — block-level accuracy and timing deltas
- `session_{ID}_{date}_by_category.json` — breakdown by message category and URL risk

## Tech Stack

React 18 + TypeScript, Vite 5, CSS Modules, React Router v6. No backend — all data in `localStorage`.

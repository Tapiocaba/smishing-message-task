# CLAUDE.md — realistic-phone

This file provides guidance to Claude Code when working in this directory.

## Project Overview

**realistic-phone** — a React 18 + TypeScript web app that simulates an iPhone 16-like SMS interface for HCI research. Part of the smishing (SMS phishing) detection study. Shows real and fake SMS messages in a realistic phone frame; records participant decisions and timing.

This is a **sister app** to `../cso-game/`. Both live in the same repo. Do not confuse their localStorage keys (`rp_*` here vs `cso_*` in cso-game).

## Build & Run

```bash
npm install
npm run dev      # opens at localhost:5174
npm run build    # TypeScript check + Vite build to dist/
npm run lint     # ESLint
```

**Node requirement:** Node 20.15.x (Vite 5 pinned). Do not upgrade Vite without upgrading Node.

## Architecture

### Immersive Phone UX

All interaction happens **inside the phone frame**. There is no external button panel. The study decisions ("Not spam" / "Report spam and delete") surface naturally as an iOS action sheet (`ReplySheet`) inside the phone.

### Phone State Machine (`usePhoneState`)

```
'locked'         ← black screen (phone sleeping)
  ↓ auto-wakes after 4–12s random delay
'notified'       ← lock screen + notification banner slides in
  ↓ tap banner
'messages_list'  ← iOS Messages conversation list
  ↓ tap row
'thread'         ← message thread + Reply button
  ↓ tap Reply
'reply_sheet'    ← action sheet: "Not spam" | "Report spam and delete"
  ↓ tap decision
'thread_marked'  ← thread shows "Marked as Spam/Safe"; Reply gone
  ↓ tap < Messages
'messages_list'  ← deleted row gone; 8s idle → 'locked'
```

`usePhoneState` owns: notification timer, idle timer, per-scenario judgements, deleted IDs, received scenario list. `GameScreen` just passes `currentScenario` and `onDecision`.

### Decision Timing

`threadOpenedAtRef` (via `performance.now()`) is set when the current trial's thread is opened (user taps notification or thread row). `decisionTimeMs` = elapsed from thread-open to decision tap — captures full deliberation time including reading.

### Phone Frame Scaling

`usePhoneScale` hook computes a `transform: scale()` factor from `window.innerHeight` so the 393×852px frame always fits in the viewport without overflowing. Scale range: [0.5, 1.0]. Applied as inline style on the outerFrame div — not via CSS media queries (they don't compose well with `transform: scale` on fixed-pixel components).

### localStorage Keys

| Key | Contents |
|---|---|
| `rp_config` | `FeatureFlags` — participant ID, block order, active feature |
| `rp_results` | `SmishingTrialResult[]` — all trial decisions |
| `rp_questionnaire` | `QuestionnaireResponse` — post-study Likert + open text |

**Never use** `cso_*` keys here — those belong to the sibling app.

### Message Data

- `src/data/messages.json` — all study messages (real + fake). Edit this file to add/change messages.
- `src/data/practiceMessages.json` — 3 warm-up messages (not recorded).
- `src/data/messages.ts` — typed loader. `getMessagesForBlock(1|2)` filters by `blockAssignment` and reverses Block 2.

**JSON schema per message:**
```json
{
  "id": "unique_snake_case_id",
  "type": "real" | "fake",
  "isPhishing": false | true,
  "category": "packageDelivery|financialDeception|businessPromotion|impersonation|political|appointment",
  "urlRisk": "safe|shortened|suspicious|dangerous",
  "sender": {
    "displayName": "Sender Name or Short Code",
    "phoneNumber": "456 or +1 (555) 123-4567",
    "senderFormat": "shortCode|fullPhone|displayName",
    "countryCode": "US",
    "countryFlag": "🇺🇸",
    "firstContactLabel": "never|3 months ago|...",
    "messageCount": 0
  },
  "body": "Full message text. May contain URLs and \\n newlines.",
  "threadPreamble": [],
  "warningReason": null | "Explanation of why this is suspicious",
  "officialURL": null | "https://official-domain.com",
  "hasImpersonationPattern": false,
  "blockAssignment": 1 | 2 | "both"
}
```

`threadPreamble`: empty array = single bubble. Add 1-2 strings for multi-message scenarios (e.g., scammer follows up).

### Study Flow

```
/researcher  → set participant ID, block order, active feature
/            → onboarding (explains 4 decisions)
/practice    → 3 warm-up trials, not recorded
/game        → 2-block study; navigates to /break after block 1
/break       → rest screen between blocks
/questionnaire → Likert scales + open-ended questions
/summary     → accuracy display + export 3 JSON files
```

### Decisions

Two options only: `'not_spam' | 'report_delete'`. Scoring:
- Accurate: phishing → report_delete, or legit → not_spam
- False positive: legit → report_delete
- False negative: phishing → not_spam (dangerous — missed threat)

"Report spam and delete" removes the row from the Messages list and adds it to a "Recently Deleted" section (read-only, iOS-style). Judgements are permanent — no undo.

### Feature Flags

Currently minimal — only `activeFeature` (string key), `participantID`, `blockOrder`. As features are added in future sprints, add boolean keys here and add the feature components as conditional renders in `GameScreen.tsx` (check `game.isFeaturesActive`). The `featureSlot` div in `GameScreen` is the designated insertion point.

### Block 2 Message Order

`getMessagesForBlock(2)` reverses the filtered pool. This partially mitigates practice effects in within-subjects comparison (same messages, different order).

### Accuracy Definition

- **Accurate**: phishing → report/ignore, OR legit → open/verify
- **False positive**: legit → report
- **False negative**: phishing → open (dangerous — missed threat)

## Module Map

| Path | Responsibility |
|---|---|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/data/messages.json` | Message content (edit here to add messages) |
| `src/data/messages.ts` | Typed loader + `getMessagesForBlock()` |
| `src/hooks/useGameState.ts` | Trial/block state machine, result recording |
| `src/hooks/usePhoneScale.ts` | Viewport-aware phone scale computation |
| `src/hooks/useTimer.ts` | Elapsed-time counter (counts up) |
| `src/hooks/useFeatureFlags.ts` | Reads `rp_config` with storage event listener |
| `src/components/phone/PhoneFrame.tsx` | iPhone 16 shell (393×852px, cosmetic buttons) |
| `src/components/phone/MessageThread.tsx` | iMessage-style bubble thread |
| `src/components/phone/MessageBubble.tsx` | Individual gray bubble with spring animation |
| `src/components/game/ActionButtons.tsx` | Vertical column of 4 decision buttons |
| `src/components/game/TrialHeader.tsx` | Top bar: round/message counter + progress dots |
| `src/screens/GameScreen.tsx` | Main study screen: phone + actions + timer |
| `src/utils/featureFlags.ts` | Read/write `rp_config`; `getActiveFeatureLabel()` |
| `src/utils/scoring.ts` | `computeIsAccurate`, `computeSessionSummary`, etc. |
| `src/utils/export.ts` | `downloadJSON`, `getExportFilenames` |
| `src/styles/tokens.css` | CSS custom properties (dark theme + phone tokens) |

## TypeScript Notes

- `verbatimModuleSyntax` is ON — use `import type` for type-only imports.
- `resolveJsonModule: true` — JSON files can be imported directly with inferred types.
- `noUnusedLocals` and `noUnusedParameters` are enforced — no unused variables.

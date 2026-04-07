# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CSO Game** — a standalone UIKit iOS app for a CS278 HCI research study (Phase 1). It simulates Signal-style SMS messages to test whether anti-phishing UI features help users identify smishing attacks. No network requests, no real Signal code, no APNs — purely local data.

The full technical specification lives in `.claude/cso_game_spec.md` (excluded from git via `.gitignore`). Read it before implementing anything.

## Build & Run

This repo contains only the spec and build plan — no Xcode project yet. When the project is scaffolded:

```
# Open in Xcode
open CSOGame.xcodeproj

# Run tests (once added)
xcodebuild test -scheme CSOGame -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Architecture

### Core Pattern: Feature Flags + Within-Subjects Design

The app runs two 20-trial blocks. Each block is either "control" (no UI features) or "feature active" (one feature flag on). Counterbalancing is set per-participant by the researcher before each session.

`SpamFeatureFlags` reads/writes `UserDefaults` keys (`cso_*`). Feature state is checked at render time in each view component — not passed as constructor arguments.

### Module Map

| Folder | Responsibility |
|---|---|
| `Models/` | Pure data: `SpamTestScenario`, `CSOTrialResult`, `CSOSessionSummary`, `SpamFeatureFlags` |
| `Views/` | All UIKit views and view controllers; feature UI components are separate views |
| `Researcher/` | Hidden settings screen (5-tap to access); configures participant ID, block order, active feature |
| `Data/` | `CSODataCollector` (in-memory trial buffer + JSON persistence), `SpamTestScenarioLibrary` (the 20-message set) |
| `Export/` | `SessionExporter` — produces two JSON files via `UIActivityViewController` after both blocks |

### Trial Flow

Each trial: reset state → (if notification feature: 2s banner with buttons disabled) → reveal message card + start 8s timer → user taps decision button → 500ms blank gap → next trial. `decisionTimeMs` is measured from when buttons become active, not from trial start.

### The 5 Feature Flags (only one active per session)

1. `senderContextStrip` — shows country, first contact date, message count below sender row
2. `linkRiskAnnotation` — inline URL risk indicators (shortened/suspicious/dangerous)
3. `messageCategoryChip` — pill label above card (e.g. "📦 Delivery Update")
4. `contextWarningBanner` — amber warning below card using `scenario.warningReason`
5. `simulatedNotificationLabel` — two-stage reveal: notification banner first (2s), then message card

### Distractor Game

`CSODistractorView` shows two colored squares; user taps SAME or DIFFERENT. New pair every 2.0 seconds, independent of message timer. Score is recorded per trial as `distractorAccuracy` but never shown during the session — only in post-session debrief. Purpose: occupy visual-spatial attention to simulate real-world cognitive load while reading messages.

### Data Export

After both blocks, `SessionExporter` presents a share sheet with:
- `session_{participantID}_{date}.json` — all 40 `CSOTrialResult` records
- `session_{participantID}_{date}_summary.json` — `CSOSessionSummary` with block-level stats and feature-vs-control deltas

Researcher exports via AirDrop or email. No server.

## Key Implementation Constraints

- **Accuracy definition**: `isAccurate = true` when phishing→report/ignore OR legit→open/verify. False negative = phishing→open (dangerous). False positive = legit→report.
- **Block 2 order**: reverse of Block 1 (msg_20..msg_01) to partially mitigate practice effects while keeping within-subjects comparison valid.
- **Researcher settings access**: Hidden behind a 5-tap gesture on launch screen. Must lock after "Initialize Session" until 5-tapped again.
- **`SenderContextStripView`**: Only renders when `senderContextStrip` flag is ON AND `scenario.sender.messageCount == 0`. Don't show it for known senders.
- **Notification banner timing**: Timer starts when banner appears (at 0s), not when card reveals (at 2s). Effective decision window is 6 seconds, not 8.

---

## React Web App (Phase 1 — Primary Implementation)

The live implementation is a **React 18 + TypeScript web app** located in `cso-game/`. This is the primary deliverable for the HCI study, not the iOS app.

### Build & Run

```bash
cd cso-game
npm install
npm run dev        # opens at localhost:5173
npm run build      # production build to dist/
```

**Node.js requirement:** Node 20.15.x works with Vite 5 (pinned). Do NOT upgrade to Vite 8+ without also upgrading Node to 20.19+.

### Tech Stack

- React 18 + TypeScript, Vite 5, CSS Modules, React Router v6
- No external UI libraries — all components are custom
- `localStorage` for all state: `cso_flags` (feature flags), `cso_results` (trial data), `cso_questionnaire`

### Routes

| Path | Screen |
|---|---|
| `/researcher` | Researcher config — not linked from participant flow |
| `/` | Onboarding |
| `/practice` | 3 warm-up trials (unrecorded) |
| `/game` | Main 2-block game |
| `/break` | Between-block break |
| `/questionnaire` | Post-study Likert + open text |
| `/summary` | Accuracy display + JSON export |

### Module Map

| Folder | Responsibility |
|---|---|
| `src/types/index.ts` | All TypeScript interfaces and type aliases |
| `src/data/scenarios.ts` | All 20 `SpamTestScenario` objects (exact spec data) |
| `src/data/practiceScenarios.ts` | 3 warm-up messages |
| `src/utils/featureFlags.ts` | Read/write `localStorage` `cso_flags` |
| `src/utils/scoring.ts` | `isAccurate`, `isFalsePositive`, `isFalseNegative`, `computeSessionSummary`, `computeCategoryStats` |
| `src/utils/export.ts` | `downloadJSON` helper |
| `src/hooks/useFeatureFlags.ts` | Reads flags from localStorage with storage event listener |
| `src/hooks/useTimer.ts` | Elapsed-time counter (counts UP, no expiry — background measurement only) |
| `src/hooks/useGameState.ts` | Trial/block state machine, records `CSOTrialResult[]` |
| `src/components/message/` | All message card sub-components (feature-gated) |
| `src/components/game/` | `CountdownBar`, `DecisionButtons` |
| `src/components/distractor/` | `DeliveryTask`, `OrderCard` (subdued left-panel distractor) |
| `src/screens/` | All screen components |
| `src/styles/tokens.css` | CSS custom properties (Cursor IDE dark aesthetic) |

### Critical Design Decisions

- **No time limit**: Users take as long as they need. `UserDecision` no longer includes `'timeout'`. The visible timer counts UP (elapsed) rather than down — purely informational, not pressure.
- **`decisionTimeMs` clock**: Uses `performance.now()` stored in a ref (not React state) when buttons become enabled. Avoids ~50ms drift from `setTimeout`. Uncapped — records real deliberation time.
- **Feature flags gating**: All feature components receive `isActive: boolean` and return `null` when false — clean control condition with zero feature UI.
- **Block 2 order**: `scenarios.reverse()` — same 20 messages in reversed order.
- **`SenderContextStrip`**: Only shown when `senderContextStrip` ON **and** `sender.messageCount === 0`. Do not show for known senders.
- **NotificationBanner timing**: 8s timer starts when banner appears; buttons enable only after 2s dismiss. Effective window is 6s.
- **TypeScript**: Uses `verbatimModuleSyntax` — always use `import type` for type-only imports.
- **Distractor accuracy**: Computed as `completedActions / (totalTasks * 2)` — each task requires 2 clicks (view + confirm). Never shown to participant.
- **Three export files**: `_trials.json` (per-trial), `_summary.json` (block-level deltas), `_by_category.json` (per-message-category + per-URL-risk breakdowns with accuracy, avg time, false positive/negative counts).

### Feature Flags (7 total, only one active per session)

1. `senderContextStrip` — country, first contact date, message count below body
2. `linkRiskAnnotation` — inline URL risk: shortened=amber⚠, suspicious=orange⚠, dangerous=red🚨
3. `messageCategoryChip` — pill above card (packageDelivery/financialDeception/etc.)
4. `contextWarningBanner` — amber strip below card from `scenario.warningReason`
5. `simulatedNotificationLabel` — 2s iOS-style notification banner before card reveals
6. `tieredRiskDot` — amber dot cycles through 3 states: dot → short reason → full detail panel
7. `isExpectedPrompt` — "Are you expecting a package?" (only for packageDelivery + non-safe URL)

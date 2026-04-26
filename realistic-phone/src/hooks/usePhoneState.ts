import { useState, useEffect, useRef, useCallback } from 'react'
import type { SmishingScenario, UserDecision } from '../types'

export type PhoneScreen =
  | 'locked'         // black screen — phone is sleeping
  | 'notified'       // lock screen lights up with notification banner
  | 'messages_list'  // iOS Messages conversation list
  | 'thread'         // reading a message thread
  | 'reply_sheet'    // action sheet: "Not spam" | "Report spam and delete"
  | 'thread_marked'  // thread after decision — shows "Marked as Spam/Safe" label
  | 'deleted_list'   // Recently Deleted section

export interface FakeNotif {
  id: number
  sender: string
  preview: string
}

const IDLE_TIMEOUT_MS = 8_000
const NOTIF_MIN_MS = 2_000
const NOTIF_MAX_MS = 60_000
const LOCKED_WAKE_MS = 3_000
const MAX_FAKE_NOTIFS = 2
const IN_APP_BANNER_MS = 5_000  // how long the in-app banner stays visible

const FAKE_NOTIF_POOL: Omit<FakeNotif, 'id'>[] = [
  { sender: 'Uber', preview: 'Your driver (David, ⭐ 4.9) is 2 min away.' },
  { sender: 'Mom', preview: 'Let me know when you\'re home! 😊' },
  { sender: 'Calendar', preview: 'Reminder: Office hours start in 15 min' },
  { sender: 'Chase Bank', preview: 'Your statement for April is now available.' },
]

/**
 * TWO NOTIFICATION STATES:
 *   • Phone sleeping ('locked') → notification wakes the lock screen ('notified')
 *   • Phone active (any other screen) → in-app overlay banner at top of screen;
 *     auto-dismisses after 5s; does NOT change the current screen.
 *
 * Trial advancement: onTrialComplete is called when the user navigates *away*
 * from thread_marked (back button OR messages shortcut), so the scheduling
 * effect never fires mid-interaction and forces a screen change.
 */
export function usePhoneState(
  currentScenario: SmishingScenario | null,
  onDecision: (decision: UserDecision, decisionTimeMs: number) => void,
  onTrialComplete: (() => void) | undefined,
  immediate = false,
  disableIdleTimeout = false
) {
  const [screen, setScreen] = useState<PhoneScreen>('locked')
  const [receivedScenarios, setReceivedScenarios] = useState<SmishingScenario[]>([])
  const [judgements, setJudgements] = useState<Record<string, UserDecision>>({})
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [viewedScenarioId, setViewedScenarioId] = useState<string | null>(null)
  const [lockedWoken, setLockedWoken] = useState(false)
  const [fakeNotifStack, setFakeNotifStack] = useState<FakeNotif[]>([])
  // Scenario whose notification arrived while the phone was active (in-app banner).
  const [inAppBanner, setInAppBanner] = useState<SmishingScenario | null>(null)

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inAppBannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fakeAppearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fakeDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const threadOpenedAtRef = useRef<number>(performance.now())
  const lastScheduledIdRef = useRef<string | null>(null)
  const notifiedScenariosRef = useRef<Set<string>>(new Set())
  const fakeNotifCountRef = useRef(0)
  const fakeIdCounterRef = useRef(0)
  const fakeNotifDecidedRef = useRef<Set<string>>(new Set())

  // Refs that let the notification timer read current values without stale closures.
  // Using refs (not closure capture) because scheduleNotification is a useCallback
  // with only [immediate] in its deps — it would otherwise capture stale values.
  const screenRef = useRef<PhoneScreen>('locked')
  const currentScenarioRef = useRef<SmishingScenario | null>(currentScenario)

  useEffect(() => { screenRef.current = screen }, [screen])
  useEffect(() => { currentScenarioRef.current = currentScenario }, [currentScenario])

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(idleTimerRef.current ?? undefined)
      clearTimeout(notifTimerRef.current ?? undefined)
      clearTimeout(wakeTimerRef.current ?? undefined)
      clearTimeout(inAppBannerTimerRef.current ?? undefined)
      clearTimeout(fakeAppearTimerRef.current ?? undefined)
      clearTimeout(fakeDismissTimerRef.current ?? undefined)
    }
  }, [])

  // ── Schedule notification for current scenario ───────────────────────────────
  // Uses screenRef/currentScenarioRef instead of closure capture so we always
  // see the live screen at the moment the timer fires, not when it was scheduled.
  const scheduleNotification = useCallback(() => {
    clearTimeout(notifTimerRef.current ?? undefined)
    clearTimeout(inAppBannerTimerRef.current ?? undefined)

    const delay = immediate
      ? 150
      : NOTIF_MIN_MS + Math.random() * (NOTIF_MAX_MS - NOTIF_MIN_MS)

    notifTimerRef.current = setTimeout(() => {
      const sc = currentScenarioRef.current
      if (!sc) return

      if (screenRef.current === 'locked' || immediate) {
        // ── Lock screen path: always for practice (immediate), also when phone is asleep ──
        // The 'notified' effect handles adding sc to receivedScenarios.
        setScreen('notified')
      } else {
        // ── In-app path: overlay banner without changing screen (game mode only) ──
        if (!notifiedScenariosRef.current.has(sc.id)) {
          notifiedScenariosRef.current.add(sc.id)
          setReceivedScenarios(prev => [sc, ...prev])
        }
        setInAppBanner(sc)
        inAppBannerTimerRef.current = setTimeout(() => {
          setInAppBanner(null)
        }, IN_APP_BANNER_MS)
      }
    }, delay)
  }, [immediate])

  // ── React to new trial scenario ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentScenario) return
    if (currentScenario.id === lastScheduledIdRef.current) return

    lastScheduledIdRef.current = currentScenario.id
    scheduleNotification()

    return () => {
      lastScheduledIdRef.current = null
      clearTimeout(notifTimerRef.current ?? undefined)
    }
  }, [currentScenario, scheduleNotification])

  // ── Add scenario to received list when lock-screen notification fires ────────
  useEffect(() => {
    if (screen !== 'notified' || !currentScenario) return
    if (notifiedScenariosRef.current.has(currentScenario.id)) return

    notifiedScenariosRef.current.add(currentScenario.id)
    setReceivedScenarios(prev => [currentScenario, ...prev])
  }, [screen, currentScenario])

  // ── Schedule stacked fake notification (once per scenario, session-capped) ───
  useEffect(() => {
    if (screen !== 'notified' || !currentScenario) return
    if (fakeNotifCountRef.current >= MAX_FAKE_NOTIFS) return
    if (fakeNotifDecidedRef.current.has(currentScenario.id)) return
    if (immediate) return

    fakeNotifDecidedRef.current.add(currentScenario.id)
    if (Math.random() > 0.4) return

    fakeNotifCountRef.current += 1
    const fakeId = ++fakeIdCounterRef.current
    const poolIdx = (fakeNotifCountRef.current - 1) % FAKE_NOTIF_POOL.length
    const fakeNotif = FAKE_NOTIF_POOL[poolIdx]

    const appearDelay = 2_000 + Math.random() * 3_000
    fakeAppearTimerRef.current = setTimeout(() => {
      setFakeNotifStack(prev => [...prev, { id: fakeId, ...fakeNotif }])
      fakeDismissTimerRef.current = setTimeout(() => {
        setFakeNotifStack(prev => prev.filter(n => n.id !== fakeId))
      }, 4_000)
    }, appearDelay)

    return () => clearTimeout(fakeAppearTimerRef.current ?? undefined)
  }, [screen, currentScenario, immediate])

  // ── Idle timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (disableIdleTimeout) return
    const idleScreens: PhoneScreen[] = [
      'messages_list', 'deleted_list',
    ]
    if (!idleScreens.includes(screen)) return

    clearTimeout(idleTimerRef.current ?? undefined)
    idleTimerRef.current = setTimeout(() => {
      setLockedWoken(false)
      setInAppBanner(null)
      setScreen('locked')
    }, IDLE_TIMEOUT_MS)

    return () => clearTimeout(idleTimerRef.current ?? undefined)
  }, [screen, disableIdleTimeout])

  // ── Clear wake state and in-app banner when phone sleeps ─────────────────────
  useEffect(() => {
    if (screen !== 'locked') {
      clearTimeout(wakeTimerRef.current ?? undefined)
      setLockedWoken(false)
    } else {
      // Phone just went to sleep — dismiss any in-app banner
      setInAppBanner(null)
      clearTimeout(inAppBannerTimerRef.current ?? undefined)
    }
  }, [screen])

  // ── Navigation actions ────────────────────────────────────────────────────────

  const tapLocked = useCallback(() => {
    setLockedWoken(true)
    clearTimeout(wakeTimerRef.current ?? undefined)
    wakeTimerRef.current = setTimeout(() => setLockedWoken(false), LOCKED_WAKE_MS)
  }, [])

  const tapNotification = useCallback(() => {
    if (!currentScenario) return
    clearTimeout(wakeTimerRef.current ?? undefined)
    setFakeNotifStack([])
    threadOpenedAtRef.current = performance.now()
    setViewedScenarioId(currentScenario.id)
    setScreen('thread')
  }, [currentScenario])

  /** Tap the in-app overlay banner → open the thread without changing lock state. */
  const tapInAppBanner = useCallback(() => {
    if (!inAppBanner) return
    clearTimeout(inAppBannerTimerRef.current ?? undefined)
    setInAppBanner(null)
    threadOpenedAtRef.current = performance.now()
    setViewedScenarioId(inAppBanner.id)
    setScreen('thread')
  }, [inAppBanner])

  const openThread = useCallback((scenarioId: string, isCurrent: boolean) => {
    if (isCurrent) threadOpenedAtRef.current = performance.now()
    setViewedScenarioId(scenarioId)
    setScreen('thread')
  }, [])

  const openReplySheet = useCallback(() => {
    if (!currentScenario) return
    if (viewedScenarioId !== currentScenario.id) return
    if (judgements[currentScenario.id]) return
    setScreen('reply_sheet')
  }, [currentScenario, viewedScenarioId, judgements])

  const closeReplySheet = useCallback(() => setScreen('thread'), [])
  const openDeleted = useCallback(() => setScreen('deleted_list'), [])

  const goBack = useCallback(() => {
    if (screen === 'thread_marked') {
      onTrialComplete?.()
      setScreen('messages_list')
    } else if (screen === 'thread') {
      setScreen('messages_list')
    } else if (screen === 'reply_sheet') {
      setScreen('thread')
    } else if (screen === 'deleted_list') {
      setScreen('messages_list')
    }
  }, [screen, onTrialComplete])

  /** Side button / lock screen shortcut → messages list. */
  const goToMessages = useCallback(() => {
    if (screen === 'thread_marked') onTrialComplete?.()
    clearTimeout(idleTimerRef.current ?? undefined)
    setFakeNotifStack([])
    setScreen('messages_list')
  }, [screen, onTrialComplete])

  // ── Decision ──────────────────────────────────────────────────────────────────

  const makeDecision = useCallback((d: UserDecision) => {
    if (!currentScenario) return
    const timeMs = Math.round(performance.now() - threadOpenedAtRef.current)

    setJudgements(prev => ({ ...prev, [currentScenario.id]: d }))
    if (d === 'report_delete') {
      setDeletedIds(prev => new Set([...prev, currentScenario.id]))
    }
    setScreen('thread_marked')
    onDecision(d, timeMs)
  }, [currentScenario, onDecision])

  // ── Derived values ────────────────────────────────────────────────────────────

  const viewedScenario = receivedScenarios.find(s => s.id === viewedScenarioId) ?? null
  const viewedJudgement = viewedScenarioId ? (judgements[viewedScenarioId] ?? null) : null
  const isCurrentTrialViewed = viewedScenarioId === currentScenario?.id

  return {
    screen,
    receivedScenarios,
    judgements,
    deletedIds,
    viewedScenario,
    viewedJudgement,
    isCurrentTrialViewed,
    lockedWoken,
    fakeNotifStack,
    inAppBanner,
    tapLocked,
    tapNotification,
    tapInAppBanner,
    openThread,
    openReplySheet,
    closeReplySheet,
    openDeleted,
    goBack,
    goToMessages,
    makeDecision,
  }
}

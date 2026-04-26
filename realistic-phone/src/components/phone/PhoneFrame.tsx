import type { SmishingScenario, UserDecision, ActiveFeatures } from '../../types'
import { usePhoneScale } from '../../hooks/usePhoneScale'
import { usePhoneState } from '../../hooks/usePhoneState'
import { DynamicIsland } from './DynamicIsland'
import { StatusBar } from './StatusBar'
import { LockScreen } from './LockScreen'
import { NotificationBanner } from './NotificationBanner'
import { MessagesList } from './MessagesList'
import { ThreadView } from './ThreadView'
import { ReplySheet } from './ReplySheet'
import { DeletedMessages } from './DeletedMessages'
import styles from './PhoneFrame.module.css'

const ALL_OFF: ActiveFeatures = {
  brandImpersonation: false,
  linkRiskAnnotation: false,
  messageCategoryChip: false,
  notificationSpamLabel: false,
  consolidatedAction: false,
  expandableRiskBar: false,
  isExpectedPrompt: false,
  tieredBlurWarning: false,
}

interface Props {
  scenario: SmishingScenario | null
  onDecision: (decision: UserDecision, decisionTimeMs: number) => void
  /** Called when the user navigates back from the post-decision screen. */
  onTrialComplete?: () => void
  /** If true, notifications fire instantly (used by PracticeScreen). */
  immediate?: boolean
  activeFeatures?: ActiveFeatures
  /** If true, the messages-list idle timer is disabled (used by Storybook modal). */
  disableIdleTimeout?: boolean
}

export function PhoneFrame({ scenario, onDecision, onTrialComplete, immediate = false, activeFeatures = ALL_OFF, disableIdleTimeout = false }: Props) {
  const scale = usePhoneScale()
  const phone = usePhoneState(scenario, onDecision, onTrialComplete, immediate, disableIdleTimeout)

  const isLockScreen = phone.screen === 'locked' || phone.screen === 'notified'
  const deletedScenarios = phone.receivedScenarios.filter(s => phone.deletedIds.has(s.id))

  return (
    <div
      className={styles.outerFrame}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
    >
      {/* Side button — opens messages list directly */}
      <button
        className={styles.sideBtn}
        onClick={phone.goToMessages}
        aria-label="Open messages"
        title="Open messages"
      />

      <div className={styles.screen}>
        <DynamicIsland />

        {isLockScreen ? (
          <LockScreen
            showBanner={phone.screen === 'notified'}
            scenario={scenario}
            onTapBanner={phone.tapNotification}
            sleeping={phone.screen === 'locked' && !phone.lockedWoken}
            onTapLocked={phone.tapLocked}
            fakeNotifStack={phone.fakeNotifStack}
            onGoToMessages={phone.goToMessages}
            isSpamActive={activeFeatures.notificationSpamLabel}
            isCategoryChipActive={activeFeatures.messageCategoryChip}
          />
        ) : (
          <>
            <StatusBar dark />

            {/* In-app notification banner — overlays active screens without changing them */}
            {phone.inAppBanner && (
              <div className={styles.inAppBannerWrap}>
                <NotificationBanner
                  scenario={phone.inAppBanner}
                  onTap={phone.tapInAppBanner}
                  isSpamActive={activeFeatures.notificationSpamLabel}
                  isCategoryChipActive={activeFeatures.messageCategoryChip}
                />
              </div>
            )}

            {phone.screen === 'messages_list' && (
              <MessagesList
                receivedScenarios={phone.receivedScenarios}
                judgements={phone.judgements}
                deletedIds={phone.deletedIds}
                currentScenarioId={scenario?.id ?? null}
                onOpenThread={phone.openThread}
                onOpenDeleted={phone.openDeleted}
                messageCategoryChipActive={activeFeatures.messageCategoryChip}
              />
            )}

            {(phone.screen === 'thread' ||
              phone.screen === 'thread_marked' ||
              phone.screen === 'reply_sheet') &&
              phone.viewedScenario && (
                <ThreadView
                  scenario={phone.viewedScenario}
                  judgement={phone.viewedJudgement}
                  onBack={phone.goBack}
                  onReply={phone.isCurrentTrialViewed && !phone.viewedJudgement
                    ? phone.openReplySheet
                    : undefined}
                  activeFeatures={activeFeatures}
                >
                  {phone.screen === 'reply_sheet' && (
                    <ReplySheet
                      onDecision={phone.makeDecision}
                      onCancel={phone.closeReplySheet}
                      isConsolidatedActive={activeFeatures.consolidatedAction}
                    />
                  )}
                </ThreadView>
              )}

            {phone.screen === 'deleted_list' && (
              <DeletedMessages
                deletedScenarios={deletedScenarios}
                onBack={phone.goBack}
                isConsolidatedActive={activeFeatures.consolidatedAction}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

import type { SmishingScenario, UserDecision } from '../../types'
import { CATEGORY_LABELS } from './features/CategoryChip'
import styles from './MessagesList.module.css'

const FAKE_ROWS = [
  { name: 'Mom', preview: 'Sounds good, see you then! 😊', time: 'Yesterday' },
  { name: 'Chase Bank', preview: 'Your statement is ready to view.', time: 'Tue' },
  { name: 'Uber', preview: 'Your driver is 2 min away.', time: 'Mon' },
]

interface Props {
  receivedScenarios: SmishingScenario[]
  judgements: Record<string, UserDecision>
  deletedIds: Set<string>
  currentScenarioId: string | null
  onOpenThread: (scenarioId: string, isCurrent: boolean) => void
  onOpenDeleted: () => void
  messageCategoryChipActive?: boolean
}

export function MessagesList({
  receivedScenarios,
  judgements,
  deletedIds,
  currentScenarioId,
  onOpenThread,
  onOpenDeleted,
  messageCategoryChipActive = false,
}: Props) {
  const visibleScenarios = receivedScenarios.filter(s => !deletedIds.has(s.id))
  const hasDeleted = deletedIds.size > 0

  return (
    <div className={styles.screen}>
      {/* Nav bar */}
      <div className={styles.navBar}>
        <span className={styles.navTitle}>Messages</span>
        <button className={styles.navIcon} aria-label="Compose">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#007aff" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className={styles.searchBar}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <span className={styles.searchPlaceholder}>Search</span>
      </div>

      <div className={styles.list}>
        {/* Study messages — newest first */}
        {visibleScenarios.map(scenario => {
          const isCurrent = scenario.id === currentScenarioId
          const judgement = judgements[scenario.id] ?? null
          const isUnread = !judgement

          return (
            <button
              key={scenario.id}
              className={styles.row}
              onClick={() => onOpenThread(scenario.id, isCurrent)}
            >
              <div className={styles.avatar}>
                {isUnread && <div className={styles.unreadDot} />}
                <div className={styles.avatarCircle}>
                  <span className={styles.avatarInitial}>
                    {scenario.sender.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.rowContent}>
                <div className={styles.rowTop}>
                  <span className={`${styles.rowName} ${isUnread ? styles.rowNameUnread : ''}`}>
                    {scenario.sender.displayName}
                  </span>
                  <span className={styles.rowTime}>just now</span>
                </div>
                {messageCategoryChipActive && (
                  <div className={styles.rowCategoryChip}>
                    {CATEGORY_LABELS[scenario.category]}
                  </div>
                )}
                <div className={styles.rowBottom}>
                  <span className={`${styles.rowPreview} ${isUnread ? styles.rowPreviewUnread : ''}`}>
                    {scenario.body.replace(/\n/g, ' ').slice(0, 60)}
                  </span>
                  <svg className={styles.chevron} viewBox="0 0 8 14" width="8" height="14" fill="none">
                    <path d="M1 1l6 6-6 6" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
          )
        })}

        {/* Static fake rows — not tappable */}
        {FAKE_ROWS.map(row => (
          <div key={row.name} className={`${styles.row} ${styles.rowFake}`} aria-hidden="true">
            <div className={styles.avatar}>
              <div className={styles.avatarCircle}>
                <span className={styles.avatarInitial}>{row.name.charAt(0)}</span>
              </div>
            </div>
            <div className={styles.rowContent}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{row.name}</span>
                <span className={styles.rowTime}>{row.time}</span>
              </div>
              <div className={styles.rowBottom}>
                <span className={styles.rowPreview}>{row.preview}</span>
                <svg className={styles.chevron} viewBox="0 0 8 14" width="8" height="14" fill="none">
                  <path d="M1 1l6 6-6 6" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        ))}

        {/* Recently Deleted — always shown, active only when there are deleted messages */}
        <div className={styles.deletedSection}>
          <button
            className={`${styles.deletedRow} ${!hasDeleted ? styles.deletedRowEmpty : ''}`}
            onClick={hasDeleted ? onOpenDeleted : undefined}
            disabled={!hasDeleted}
          >
            <span className={styles.deletedLabel}>Recently Deleted</span>
            <div className={styles.deletedRight}>
              {hasDeleted && <span className={styles.deletedCount}>{deletedIds.size}</span>}
              <svg viewBox="0 0 8 14" width="8" height="14" fill="none">
                <path d="M1 1l6 6-6 6" stroke={hasDeleted ? '#c7c7cc' : '#d1d1d6'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

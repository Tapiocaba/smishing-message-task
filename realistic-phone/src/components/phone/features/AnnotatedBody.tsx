import type { URLRiskLevel } from '../../../types'
import { parseBodyUrls } from '../../../utils/parseBodyUrls'
import styles from './AnnotatedBody.module.css'

const URL_PREFIX: Record<Exclude<URLRiskLevel, 'safe'>, string> = {
  shortened:  '⚠️ ',
  suspicious: '⚠️ ',
  dangerous:  '⚠️ ',
}

const URL_CLASS: Record<URLRiskLevel, string> = {
  safe:       styles.urlSafe,
  shortened:  styles.urlShortened,
  suspicious: styles.urlSuspicious,
  dangerous:  styles.urlDangerous,
}

const URL_TOOLTIP: Record<Exclude<URLRiskLevel, 'safe'>, string> = {
  shortened:  'Shortened URL — real destination is hidden',
  suspicious: 'Unusual domain — likely not the official site',
  dangerous:  'Known phishing domain — do not tap this link',
}

interface Props {
  body: string
  urlRisk: URLRiskLevel
  isActive: boolean
}

export function AnnotatedBody({ body, urlRisk, isActive }: Props) {
  if (!isActive) {
    return <span className={styles.body}>{body}</span>
  }

  const segments = parseBodyUrls(body)

  return (
    <span className={styles.body}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i}>{seg.content}</span>
        if (urlRisk === 'safe') {
          return <span key={i} className={styles.urlSafe}>{seg.content}</span>
        }
        return (
          <span
            key={i}
            className={`${URL_CLASS[urlRisk]} ${styles.urlTooltipHost}`}
          >
            {URL_PREFIX[urlRisk]}{seg.content}
            <span className={styles.tooltip} aria-hidden="true">
              {URL_TOOLTIP[urlRisk]}
            </span>
          </span>
        )
      })}
    </span>
  )
}

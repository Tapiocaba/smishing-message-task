import type { URLRiskLevel } from '../../types'
import styles from './LinkRiskBadge.module.css'

interface Props {
  body: string
  urlRisk: URLRiskLevel
  isActive: boolean
}

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g

export function LinkRiskBadge({ body, urlRisk, isActive }: Props) {
  if (!isActive || urlRisk === 'safe') {
    return <p className={styles.body}>{body}</p>
  }

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  const matches = [...body.matchAll(URL_REGEX)]

  if (matches.length === 0) {
    return <p className={styles.body}>{body}</p>
  }

  matches.forEach((match, i) => {
    const start = match.index!
    const end = start + match[0].length

    if (start > lastIndex) {
      parts.push(body.slice(lastIndex, start))
    }

    const urlText = match[0]

    if (urlRisk === 'shortened') {
      parts.push(
        <span
          key={i}
          className={styles.urlShortened}
          title="Shortened URL — destination unknown"
        >
          {urlText}⚠
        </span>
      )
    } else if (urlRisk === 'suspicious') {
      parts.push(
        <span key={i}>
          <span className={styles.urlSuspicious} title="Suspicious domain">
            {urlText}⚠
          </span>
          <span className={`${styles.inlineLabel} ${styles.labelSuspicious}`}>
            suspicious domain
          </span>
        </span>
      )
    } else if (urlRisk === 'dangerous') {
      parts.push(
        <span key={i}>
          <span className={styles.urlDangerous} title="Domain mismatch detected">
            {urlText}🚨
          </span>
          <span className={`${styles.inlineLabel} ${styles.labelDangerous}`}>
            domain mismatch
          </span>
        </span>
      )
    }

    lastIndex = end
  })

  if (lastIndex < body.length) {
    parts.push(body.slice(lastIndex))
  }

  return <p className={styles.body}>{parts}</p>
}

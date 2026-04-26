import type { URLRiskLevel } from '../../types'
import { AnnotatedBody } from './features/AnnotatedBody'
import styles from './MessageBubble.module.css'

interface Props {
  text: string
  isNew?: boolean
  urlRisk?: URLRiskLevel
  isLinkRiskActive?: boolean
}

export function MessageBubble({ text, isNew = false, urlRisk, isLinkRiskActive = false }: Props) {
  return (
    <div className={`${styles.bubble} ${isNew ? styles.isNew : ''}`}>
      {isLinkRiskActive && urlRisk
        ? <AnnotatedBody body={text} urlRisk={urlRisk} isActive />
        : text}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { QuestionnaireResponse } from '../types'
import styles from './QuestionnaireScreen.module.css'

const LIKERT_QUESTIONS: { key: keyof Pick<QuestionnaireResponse, 'likertHelpful' | 'likertIntrusive' | 'likertConfident' | 'likertEasy'>; text: string }[] = [
  { key: 'likertHelpful',   text: 'The information shown helped me decide if a message was real or fake.' },
  { key: 'likertIntrusive', text: 'The information shown felt distracting or annoying.' },
  { key: 'likertConfident', text: 'I felt confident in my decisions.' },
  { key: 'likertEasy',      text: 'The decisions felt easy to make quickly.' },
]

export function QuestionnaireScreen() {
  const navigate = useNavigate()
  const [likert, setLikert] = useState({ likertHelpful: 3, likertIntrusive: 3, likertConfident: 3, likertEasy: 3 })
  const [open, setOpen] = useState({ openDifference: '', openHelpful: '', openConfusing: '' })

  function handleSubmit() {
    const response: QuestionnaireResponse = { ...likert, ...open }
    localStorage.setItem('cso_questionnaire', JSON.stringify(response))
    navigate('/summary')
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Quick Reflection</h2>
          <p className={styles.subtitle}>A few short questions about your experience. No right or wrong answers.</p>
        </div>

        {/* Likert Section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Rate your agreement (1 = Strongly disagree, 5 = Strongly agree)</div>
          {LIKERT_QUESTIONS.map(q => (
            <div key={q.key} className={styles.likertItem}>
              <div className={styles.question}>{q.text}</div>
              <div className={styles.sliderRow}>
                <span className={styles.sliderEndLabel}>Strongly disagree</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={likert[q.key]}
                  onChange={e => setLikert(prev => ({ ...prev, [q.key]: Number(e.target.value) }))}
                  className={styles.slider}
                />
                <span className={styles.sliderValue}>{likert[q.key]}</span>
                <span className={`${styles.sliderEndLabel}`} style={{ textAlign: 'right' }}>Strongly agree</span>
              </div>
            </div>
          ))}
        </div>

        {/* Open Text Section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Open responses (optional)</div>
          {[
            { key: 'openDifference' as const, label: 'Did you notice anything different about the messages in one round versus the other?', placeholder: 'Describe what you noticed…' },
            { key: 'openHelpful'   as const, label: 'Was there any information shown that you found helpful? What was it?', placeholder: 'Describe what was helpful…' },
            { key: 'openConfusing' as const, label: 'Was there anything that felt confusing or that got in the way?', placeholder: 'Describe any issues…' },
          ].map(item => (
            <div key={item.key} className={styles.openItem}>
              <div className={styles.openLabel}>{item.label}</div>
              <textarea
                className={styles.textarea}
                placeholder={item.placeholder}
                value={open[item.key]}
                onChange={e => setOpen(prev => ({ ...prev, [item.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit →
        </button>
      </div>
    </div>
  )
}

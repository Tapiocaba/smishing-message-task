import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { QuestionnaireResponse } from '../types'
import styles from './QuestionnaireScreen.module.css'

const QUESTIONNAIRE_KEY = 'rp_questionnaire'

const DEFAULT: QuestionnaireResponse = {
  likertHelpful: 3,
  likertIntrusive: 3,
  likertConfident: 3,
  likertEasy: 3,
  openDifference: '',
  openHelpful: '',
  openConfusing: '',
}

const LIKERT_QUESTIONS: { key: keyof QuestionnaireResponse; label: string }[] = [
  { key: 'likertHelpful',   label: 'The interface helped me make better decisions.' },
  { key: 'likertIntrusive', label: 'The interface felt intrusive or distracting.' },
  { key: 'likertConfident', label: 'I felt confident in my decisions.' },
  { key: 'likertEasy',      label: 'The task was easy to complete.' },
]

export function QuestionnaireScreen() {
  const navigate = useNavigate()
  const [resp, setResp] = useState<QuestionnaireResponse>(DEFAULT)

  function setLikert(key: keyof QuestionnaireResponse, val: number) {
    setResp(r => ({ ...r, [key]: val }))
  }

  function handleSubmit() {
    localStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify(resp))
    navigate('/summary', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Post-Study Questions</h1>

        <div className={styles.section}>
          {LIKERT_QUESTIONS.map(({ key, label }) => (
            <div key={key} className={styles.likertRow}>
              <p className={styles.likertLabel}>{label}</p>
              <div className={styles.scale}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`${styles.scaleBtn} ${resp[key] === n ? styles.scaleBtnActive : ''}`}
                    onClick={() => setLikert(key, n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className={styles.scaleAnchors}>
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          {([
            ['openDifference', 'Did you notice anything different between the two rounds?'],
            ['openHelpful',    'What (if anything) helped you identify suspicious messages?'],
            ['openConfusing',  'What (if anything) was confusing or unhelpful?'],
          ] as [keyof QuestionnaireResponse, string][]).map(([key, label]) => (
            <div key={key} className={styles.openRow}>
              <label className={styles.openLabel}>{label}</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={resp[key] as string}
                onChange={e => setResp(r => ({ ...r, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit & View Results →
        </button>
      </div>
    </div>
  )
}

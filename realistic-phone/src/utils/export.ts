export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getExportFilenames(participantID: string): {
  trials: string
  summary: string
  byCategory: string
} {
  const date = new Date().toISOString().split('T')[0]
  const base = `session_${participantID}_${date}`
  return {
    trials: `${base}_trials.json`,
    summary: `${base}_summary.json`,
    byCategory: `${base}_by_category.json`,
  }
}

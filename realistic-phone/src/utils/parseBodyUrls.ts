export interface BodySegment {
  type: 'text' | 'url'
  content: string
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g

export function parseBodyUrls(body: string): BodySegment[] {
  const segments: BodySegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  URL_REGEX.lastIndex = 0
  while ((match = URL_REGEX.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: body.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'url', content: match[0] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < body.length) {
    segments.push({ type: 'text', content: body.slice(lastIndex) })
  }

  return segments
}

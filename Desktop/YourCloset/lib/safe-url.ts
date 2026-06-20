/** Permite solo esquemas http: y https:. Retorna '#' para cualquier otra cosa. */
export function safeUrl(url: string | null | undefined): string {
  if (!url) return '#'
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:' ? url : '#'
  } catch {
    return '#'
  }
}

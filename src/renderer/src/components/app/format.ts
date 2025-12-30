/**
 * Small formatting helpers for turning file system names into UI labels.
 */

/**
 * Returns the last path segment for display (handles Windows and POSIX separators).
 */
export function basename(path: string): string {
  return path.split(/[/\\]/).filter(Boolean).pop() ?? path
}

/**
 * Turns a PDF filename into a human-friendly score title.
 */
export function toScoreTitle(fileName: string): string {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Builds a YouTube search URL for a score title.
 */
export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}


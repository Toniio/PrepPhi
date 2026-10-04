import type { Downloader } from '../types'

type Downloads = typeof Claude.downloads

/** Files through the `downloads` capability: the viewer confirms each save. */
export function createClaudeDownloader(downloads: Downloads | null): Downloader {
  return {
    available: downloads !== null,

    async save(filename, data) {
      if (!downloads) return 'unavailable'
      try {
        await downloads.save({ filename, data })
        return 'saved'
      } catch (error) {
        const code = (error as Partial<Claude.downloads.DownloadsError>).code
        if (code === 'declined' || code === 'rate_limited') return 'declined'
        if (code === 'bad_request' || code === 'rejected_extension' || code === 'transform_error') {
          throw new Error(`Download refused: ${code}`)
        }
        return 'unavailable'
      }
    },
  }
}

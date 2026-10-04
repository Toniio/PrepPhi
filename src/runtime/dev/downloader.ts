import type { Downloader } from '../types'

/** A plain browser download, through a temporary object URL. */
export function createDevDownloader(): Downloader {
  return {
    available: true,

    async save(filename, data) {
      const blob = typeof data === 'string' ? new Blob([data], { type: 'application/json' }) : data
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return 'saved'
    },
  }
}

import { ExternalLink, Folder, X, Youtube } from 'lucide-react'

import { toScoreTitle } from '@renderer/components/app/format'
import type { PdfFile } from '@renderer/components/app/types'
import { Button } from '@renderer/components/ui/button'
import { Skeleton } from '@renderer/components/ui/skeleton'

export type PdfViewerModalProps = {
  folderLabel: string | null
  pdf: PdfFile
  blobUrl: string | null
  error: string | null
  isLoading: boolean
  onClose: () => void
  onOpenYoutube: () => void
  onRevealFile: () => void
  onOpenFile: () => void
  onRetry: () => void
}

/**
 * Modal PDF viewer that:
 * - embeds the PDF (via `blob:` URL)
 * - provides quick actions (YouTube, reveal, open externally)
 */
export function PdfViewerModal({
  folderLabel,
  pdf,
  blobUrl,
  error,
  isLoading,
  onClose,
  onOpenYoutube,
  onRevealFile,
  onOpenFile,
  onRetry
}: PdfViewerModalProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-xs text-muted-foreground">{folderLabel ?? 'Library'}</div>
            <div className="truncate text-sm font-semibold tracking-tight">{toScoreTitle(pdf.name)}</div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search on YouTube"
              onClick={onOpenYoutube}
            >
              <Youtube className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Reveal in folder" onClick={onRevealFile}>
              <Folder className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Open in system viewer" onClick={onOpenFile}>
              <ExternalLink className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={onClose}
              autoFocus
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-muted/30">
          {blobUrl ? (
            <iframe title={toScoreTitle(pdf.name)} src={blobUrl} className="h-full w-full" />
          ) : error ? (
            <div className="grid h-full place-items-center p-6 text-center">
              <div className="max-w-md">
                <div className="text-base font-semibold tracking-tight">Couldn’t load this PDF</div>
                <div className="mt-1 text-sm text-muted-foreground">{error}</div>
                <div className="mt-4 flex justify-center gap-2">
                  <Button variant="outline" onClick={onOpenFile}>
                    Open in system viewer
                  </Button>
                  <Button onClick={onRetry}>Retry</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-6">
              <div className="w-full max-w-xl space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-[22rem] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/5" />
                {isLoading && <div className="text-xs text-muted-foreground">Loading…</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


import type { MouseEvent } from 'react'
import { ExternalLink, FolderOpen, RefreshCcw, Search, Youtube } from 'lucide-react'

import { basename, toScoreTitle } from '@renderer/components/app/format'
import type { PdfFile } from '@renderer/components/app/types'
import { cn } from '@renderer/lib/utils'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card } from '@renderer/components/ui/card'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@renderer/components/ui/context-menu'
import { Input } from '@renderer/components/ui/input'
import { Skeleton } from '@renderer/components/ui/skeleton'

export type ScoresPaneProps = {
  libraryRoot: string | null
  selectedFolder: string | null
  pdfQuery: string
  pdfs: PdfFile[]
  isLoadingPdfs: boolean
  statusText: string | null
  onChooseLibrary: () => void
  onRefreshPdfs: () => void
  onPdfQueryChange: (value: string) => void
  onOpenPdf: (pdf: PdfFile) => void
  onOpenYoutube: (pdf: PdfFile) => void
  onOpenFile: (pdf: PdfFile) => void
  onRevealFile: (pdf: PdfFile) => void
  onToggleTheme: () => void
}

/**
 * Right pane that lists PDFs in the selected folder (search + list layout).
 */
export function ScoresPane({
  libraryRoot,
  selectedFolder,
  pdfQuery,
  pdfs,
  isLoadingPdfs,
  statusText,
  onChooseLibrary,
  onRefreshPdfs,
  onPdfQueryChange,
  onOpenPdf,
  onOpenYoutube,
  onOpenFile,
  onRevealFile,
  onToggleTheme
}: ScoresPaneProps): React.JSX.Element {
  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b bg-background/30 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{libraryRoot ? basename(libraryRoot) : 'No library selected'}</span>
            {selectedFolder && (
              <>
                <span className="text-muted-foreground/40">/</span>
                <span className="truncate">{selectedFolder}</span>
              </>
            )}
          </div>
          <div className="truncate text-lg font-semibold tracking-tight">
            {selectedFolder ? selectedFolder : libraryRoot ? 'Select a folder' : 'Choose a library'}
          </div>
        </div>

        {libraryRoot && selectedFolder && (
          <div className="flex items-center gap-2">
            <div className="relative w-[18rem]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={pdfQuery}
                onChange={(e) => onPdfQueryChange(e.target.value)}
                placeholder="Search scores…"
                className="pl-9"
              />
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onRefreshPdfs} aria-label="Refresh scores">
              <RefreshCcw className={cn('size-4', isLoadingPdfs && 'animate-spin')} />
            </Button>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-5">
          {!libraryRoot ? (
            <div className="mx-auto mt-10 max-w-xl">
              <Card className="border-dashed bg-background/60 p-6">
                <div className="flex items-start gap-4">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FolderOpen className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold tracking-tight">Choose your PDF library</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Pick a folder that contains subfolders, then browse and open scores without leaving the
                      lesson flow.
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onClick={onChooseLibrary}>
                        <FolderOpen className="size-4" />
                        Choose library
                      </Button>
                      <Button variant="outline" onClick={onToggleTheme}>
                        Toggle theme
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : !selectedFolder ? (
            <div className="mx-auto mt-10 max-w-xl text-center">
              <div className="text-base font-semibold tracking-tight">Select a folder</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Choose a subfolder on the left to see the PDFs inside.
              </div>
            </div>
          ) : statusText ? (
            <div className="mx-auto mt-10 max-w-xl text-center">
              <div className="text-base font-semibold tracking-tight">{statusText}</div>
              <div className="mt-1 text-sm text-muted-foreground">Try refreshing or selecting another folder.</div>
            </div>
          ) : isLoadingPdfs ? (
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : pdfs.length === 0 ? (
            <div className="mx-auto mt-10 max-w-xl text-center">
              <div className="text-base font-semibold tracking-tight">No PDFs found</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {pdfQuery ? 'Try a different search.' : 'Add PDFs to this folder to see them here.'}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{pdfs.length}</span>{' '}
                  {pdfs.length === 1 ? 'score' : 'scores'}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border bg-background/60 shadow-sm">
                <div className="divide-y divide-border">
                  {pdfs.map((pdf) => (
                    <PdfRow
                      key={pdf.path}
                      pdf={pdf}
                      onOpen={() => onOpenPdf(pdf)}
                      onYoutube={() => onOpenYoutube(pdf)}
                      onOpenFile={() => onOpenFile(pdf)}
                      onReveal={() => onRevealFile(pdf)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

type PdfRowProps = {
  pdf: PdfFile
  onOpen: () => void
  onYoutube: () => void
  onOpenFile: () => void
  onReveal: () => void
}

/**
 * A single score row with hover actions and a right-click context menu.
 */
function PdfRow({ pdf, onOpen, onYoutube, onOpenFile, onReveal }: PdfRowProps): React.JSX.Element {
  function handleYoutubeClick(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation()
    onYoutube()
  }

  function handleOpenFileClick(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation()
    onOpenFile()
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex w-full items-center gap-3 px-3 py-2 text-left transition',
            'hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-ring/30 focus-visible:ring-[3px]'
          )}
          onClick={onOpen}
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium tracking-tight">{toScoreTitle(pdf.name)}</div>
            <div className="truncate text-xs text-muted-foreground">{pdf.name}</div>
          </div>

          <Badge variant="secondary" className="hidden h-5 shrink-0 sm:inline-flex">
            pdf
          </Badge>

          <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search on YouTube"
              onClick={handleYoutubeClick}
            >
              <Youtube className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open in system viewer"
              onClick={handleOpenFileClick}
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={onOpen}>View</ContextMenuItem>
        <ContextMenuItem onClick={onYoutube}>Search on YouTube</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onOpenFile}>Open in system viewer</ContextMenuItem>
        <ContextMenuItem onClick={onReveal}>Reveal in folder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

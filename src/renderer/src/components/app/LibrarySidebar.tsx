import { Folder, FolderOpen, Music2, RefreshCcw, Search } from 'lucide-react'

import { cn } from '@renderer/lib/utils'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Separator } from '@renderer/components/ui/separator'

export type LibrarySidebarProps = {
  libraryName: string | null
  libraryRoot: string | null
  folders: string[]
  folderQuery: string
  isLoadingFolders: boolean
  selectedFolder: string | null
  statusText: string | null
  onChooseLibrary: () => void
  onRefreshFolders: () => void
  onFolderQueryChange: (value: string) => void
  onSelectFolder: (folder: string) => void
}

/**
 * Left pane navigation for a library:
 * - library picker + refresh
 * - folder search
 * - folder list
 */
export function LibrarySidebar({
  libraryName,
  libraryRoot,
  folders,
  folderQuery,
  isLoadingFolders,
  selectedFolder,
  statusText,
  onChooseLibrary,
  onRefreshFolders,
  onFolderQueryChange,
  onSelectFolder
}: LibrarySidebarProps): React.JSX.Element {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r bg-background/50">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Music2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-semibold tracking-tight">ScoreShelf</div>
              <Badge variant="secondary" className="h-5">
                beta
              </Badge>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {libraryRoot ? `Library: ${libraryName ?? '—'}` : 'Choose a folder to start'}
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={onChooseLibrary}>
            <FolderOpen className="size-4" />
            {libraryRoot ? 'Change library' : 'Choose library'}
          </Button>
          {libraryRoot && (
            <Button variant="ghost" size="icon-sm" onClick={onRefreshFolders} aria-label="Refresh folders">
              <RefreshCcw className={cn('size-4', isLoadingFolders && 'animate-spin')} />
            </Button>
          )}
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={folderQuery}
            onChange={(e) => onFolderQueryChange(e.target.value)}
            placeholder="Search folders…"
            className="pl-9"
            disabled={!libraryRoot}
          />
        </div>
      </div>

      <Separator />

      <ScrollArea className="min-h-0 flex-1 p-2">
        {!libraryRoot ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">
            Pick a library folder. Subfolders become your “sets” (student, composer, genre, etc.).
          </div>
        ) : statusText ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">{statusText}</div>
        ) : (
          <div className="space-y-1">
            {folders.map((folder) => {
              const isActive = folder === selectedFolder
              return (
                <Button
                  key={folder}
                  variant="ghost"
                  className={cn(
                    'h-10 w-full justify-start gap-2 rounded-lg px-3 text-sm',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => onSelectFolder(folder)}
                >
                  <Folder className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="min-w-0 flex-1 truncate">{folder}</span>
                </Button>
              )
            })}
          </div>
        )}
      </ScrollArea>

      <div className="border-t bg-background/40 px-4 py-3 text-xs text-muted-foreground">
        Tip: Right-click a score for quick actions.
      </div>
    </aside>
  )
}


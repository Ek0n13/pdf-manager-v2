import { useMemo, useRef, useState } from 'react'

import { basename, toScoreTitle, youtubeSearchUrl } from '@renderer/components/app/format'
import type { PdfFile } from '@renderer/components/app/types'
import { LibrarySidebar } from '@renderer/components/app/LibrarySidebar'
import { PdfViewerModal } from '@renderer/components/app/PdfViewerModal'
import { ScoresPane } from '@renderer/components/app/ScoresPane'

const RECENTS_KEY = 'pdf-manager-v2:libraryRoot'

/**
 * Top-level UI + state coordinator for the renderer.
 *
 * Notes:
 * - React effects are intentionally avoided; all IO is triggered by explicit user actions.
 * - Async calls are guarded with request ids to prevent stale updates.
 */
export function AppShell(): React.JSX.Element {
  const [libraryRoot, setLibraryRoot] = useState<string | null>(() => {
    return localStorage.getItem(RECENTS_KEY)
  })
  const [subFolders, setSubFolders] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([])

  const [folderQuery, setFolderQuery] = useState('')
  const [pdfQuery, setPdfQuery] = useState('')

  const [isLoadingFolders, setIsLoadingFolders] = useState(false)
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(false)
  const [hasLoadedFolders, setHasLoadedFolders] = useState(false)
  const [hasLoadedPdfs, setHasLoadedPdfs] = useState(false)

  const [activePdf, setActivePdf] = useState<PdfFile | null>(null)
  const [activePdfBlobUrl, setActivePdfBlobUrl] = useState<string | null>(null)
  const [activePdfError, setActivePdfError] = useState<string | null>(null)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)

  const foldersRequestId = useRef(0)
  const pdfsRequestId = useRef(0)
  const pdfRequestId = useRef(0)

  const libraryName = useMemo(() => (libraryRoot ? basename(libraryRoot) : null), [libraryRoot])

  const filteredFolders = useMemo(() => {
    const query = folderQuery.trim().toLowerCase()
    if (!query) return subFolders
    return subFolders.filter((folder) => folder.toLowerCase().includes(query))
  }, [folderQuery, subFolders])

  const filteredPdfs = useMemo(() => {
    const query = pdfQuery.trim().toLowerCase()
    if (!query) return pdfFiles
    return pdfFiles.filter((pdf) => toScoreTitle(pdf.name).toLowerCase().includes(query))
  }, [pdfFiles, pdfQuery])

  const sidebarStatusText = useMemo(() => {
    if (!libraryRoot) return null
    if (isLoadingFolders) return 'Loading folders…'
    if (!hasLoadedFolders) return 'Click refresh to load folders.'
    if (filteredFolders.length === 0) return folderQuery ? 'No matching folders.' : 'No folders found.'
    return null
  }, [filteredFolders.length, folderQuery, hasLoadedFolders, isLoadingFolders, libraryRoot])

  const scoresStatusText = useMemo(() => {
    if (!libraryRoot || !selectedFolder) return null
    if (isLoadingPdfs) return null
    if (!hasLoadedPdfs) return 'Click refresh to load scores.'
    return null
  }, [hasLoadedPdfs, isLoadingPdfs, libraryRoot, selectedFolder])

  /**
   * Loads the library's subfolders and then loads PDFs for the selected folder.
   */
  async function loadFolders(root: string): Promise<void> {
    const requestId = (foldersRequestId.current += 1)
    setIsLoadingFolders(true)
    setHasLoadedFolders(true)

    const dirs = await window.api.getSubDirectories(root)
    if (requestId !== foldersRequestId.current) return

    setIsLoadingFolders(false)
    const nextFolders = dirs ?? []
    setSubFolders(nextFolders)

    const nextSelected =
      selectedFolder && nextFolders.includes(selectedFolder) ? selectedFolder : (nextFolders[0] ?? null)
    setSelectedFolder(nextSelected)

    setPdfFiles([])
    setHasLoadedPdfs(false)
    if (nextSelected) void loadPdfs(root, nextSelected)
  }

  /**
   * Loads PDFs for a specific library folder.
   */
  async function loadPdfs(root: string, folder: string): Promise<void> {
    const requestId = (pdfsRequestId.current += 1)
    setIsLoadingPdfs(true)
    setHasLoadedPdfs(true)

    const files = await window.api.getPdfFiles(root, folder)
    if (requestId !== pdfsRequestId.current) return

    setIsLoadingPdfs(false)
    setPdfFiles(files ?? [])
  }

  /**
   * Prompts the user to pick a library root folder and immediately loads it.
   */
  async function handleChooseLibrary(): Promise<void> {
    const dir = await window.api.chooseDirectory()
    if (!dir) return

    localStorage.setItem(RECENTS_KEY, dir)
    setLibraryRoot(dir)

    setFolderQuery('')
    setPdfQuery('')
    setSubFolders([])
    setSelectedFolder(null)
    setPdfFiles([])
    setHasLoadedFolders(false)
    setHasLoadedPdfs(false)

    void loadFolders(dir)
  }

  /**
   * Updates the active folder and loads its PDFs.
   */
  function handleSelectFolder(folder: string): void {
    if (!libraryRoot) return
    setSelectedFolder(folder)
    setPdfFiles([])
    setHasLoadedPdfs(false)
    void loadPdfs(libraryRoot, folder)
  }

  /**
   * Refreshes the folder list (and the PDF list for the selected folder).
   */
  function handleRefreshFolders(): void {
    if (!libraryRoot) return
    void loadFolders(libraryRoot)
  }

  /**
   * Refreshes PDFs for the current folder.
   */
  function handleRefreshPdfs(): void {
    if (!libraryRoot || !selectedFolder) return
    void loadPdfs(libraryRoot, selectedFolder)
  }

  /**
   * Closes the viewer and revokes any active blob URL.
   */
  function closeViewer(): void {
    pdfRequestId.current += 1
    setActivePdf(null)
    setActivePdfError(null)
    setIsLoadingPdf(false)
    setActivePdfBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  /**
   * Reads a PDF via IPC and prepares a `blob:` URL for the embedded viewer.
   */
  async function openPdf(pdf: PdfFile): Promise<void> {
    const requestId = (pdfRequestId.current += 1)
    setActivePdf(pdf)
    setActivePdfError(null)
    setIsLoadingPdf(true)
    setActivePdfBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    const data = await window.api.readPdfFile(pdf.path)
    if (requestId !== pdfRequestId.current) return

    if (!data) {
      setActivePdfError('Unable to load this PDF.')
      setIsLoadingPdf(false)
      return
    }

    const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    setActivePdfBlobUrl(url)
    setIsLoadingPdf(false)
  }

  /**
   * Opens a YouTube search for the score title in the system browser.
   */
  async function openYoutube(pdf: PdfFile): Promise<void> {
    await window.api.openExternal(youtubeSearchUrl(toScoreTitle(pdf.name)))
  }

  /**
   * Opens the PDF in the OS default PDF viewer.
   */
  async function openFile(pdf: PdfFile): Promise<void> {
    await window.api.openFile(pdf.path)
  }

  /**
   * Reveals the PDF in the OS file explorer.
   */
  async function revealFile(pdf: PdfFile): Promise<void> {
    await window.api.revealInFolder(pdf.path)
  }

  /**
   * Simple theme toggle (useful while iterating on design).
   */
  function toggleTheme(): void {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-background via-background to-muted/60 p-3">
      <div className="h-full w-full overflow-hidden rounded-2xl border bg-card/60 shadow-xl backdrop-blur">
        <div className="flex h-full">
          <LibrarySidebar
            libraryName={libraryName}
            libraryRoot={libraryRoot}
            folders={filteredFolders}
            folderQuery={folderQuery}
            isLoadingFolders={isLoadingFolders}
            selectedFolder={selectedFolder}
            statusText={sidebarStatusText}
            onChooseLibrary={() => void handleChooseLibrary()}
            onRefreshFolders={handleRefreshFolders}
            onFolderQueryChange={setFolderQuery}
            onSelectFolder={handleSelectFolder}
          />

          <ScoresPane
            libraryRoot={libraryRoot}
            selectedFolder={selectedFolder}
            pdfQuery={pdfQuery}
            pdfs={filteredPdfs}
            isLoadingPdfs={isLoadingPdfs}
            statusText={scoresStatusText}
            onChooseLibrary={() => void handleChooseLibrary()}
            onRefreshPdfs={handleRefreshPdfs}
            onPdfQueryChange={setPdfQuery}
            onOpenPdf={(pdf) => void openPdf(pdf)}
            onOpenYoutube={(pdf) => void openYoutube(pdf)}
            onOpenFile={(pdf) => void openFile(pdf)}
            onRevealFile={(pdf) => void revealFile(pdf)}
            onToggleTheme={toggleTheme}
          />
        </div>
      </div>

      {activePdf && (
        <PdfViewerModal
          folderLabel={selectedFolder}
          pdf={activePdf}
          blobUrl={activePdfBlobUrl}
          error={activePdfError}
          isLoading={isLoadingPdf}
          onClose={closeViewer}
          onOpenYoutube={() => void openYoutube(activePdf)}
          onRevealFile={() => void revealFile(activePdf)}
          onOpenFile={() => void openFile(activePdf)}
          onRetry={() => void openPdf(activePdf)}
        />
      )}
    </div>
  )
}

import type { PathFullPath } from '@shared/types'
import { useCallback, useRef, useState } from 'react'
import ScrollAreaCustom from './ScrollAreaCustom'
import PdfDialog from './PdfDialog'
import RenameFunc from './RenameFunc'
import UserListDialog from './UserListDialog'

function RightPanel({
  parentDir,
  pdfList,
  dialogContainer,
  reloadPdfList
}: {
  parentDir: string
  pdfList: PathFullPath[]
  dialogContainer?: React.RefObject<HTMLDivElement | null>
  reloadPdfList: () => Promise<void>
}): React.JSX.Element {
  const [currentUserId, setCurrentUserId] = useState<number>(-1)
  const [currentUserLastPlayed, setCurrentUserLastPlayed] = useState<string>('<none>')

  const [currentRow, setCurrentRow] = useState<HTMLDivElement | null>(null)

  const pdfRefs = useRef(new Map<string, HTMLDivElement>())
  const removeHighlightFired = useRef<boolean>(false)

  const handleSaveUserLastPlayed = useCallback(
    async (lastPlayed: string) => {
      try {
        const actionHappened = await window.api.dbSaveUserLastPlayed(currentUserId, lastPlayed)
        if (actionHappened) setCurrentUserLastPlayed(lastPlayed)
      } catch (error) {
        console.error(error)
        return
      }
    },
    [currentUserId]
  )

  const handleDeleteFile = useCallback(
    async (pathFullPath: PathFullPath) => {
      try {
        const actionHappened = await window.api.deleteFile(pathFullPath)
        if (actionHappened) reloadPdfList()
      } catch (error) {
        console.error(error)
        return
      }
    },
    [reloadPdfList]
  )

  const handleScrollToElement = useCallback(() => {
    const element = pdfRefs.current.get(currentUserLastPlayed)
    if (!element) return
    element.classList.add('bg-red-400')
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentUserLastPlayed])

  const removeHighlight = useCallback(() => {
    if (removeHighlightFired.current) return

    const element = pdfRefs.current.get(currentUserLastPlayed)
    if (element) {
      removeHighlightFired.current = true
      setTimeout(() => {
        element?.classList.remove('bg-red-400')
        removeHighlightFired.current = false
      }, 5000)
    }
  }, [currentUserLastPlayed])

  const handlePdfBtnClicked = useCallback(
    (path: string) => {
      if (currentRow) currentRow?.classList.remove('font-bold')

      const clickedRow = pdfRefs.current.get(path)
      if (!clickedRow) return

      clickedRow?.classList.add('font-bold')
      clickedRow.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setCurrentRow(clickedRow)
    },
    [currentRow]
  )

  // no idea why adding "min-h-0" to the parent div works
  return (
    <div className="min-h-0 w-full flex flex-col">
      <div className="m-1 p-2 border-2 rounded-md text-center text-lg font-bold bg-gray-50">
        <pre className="truncate">{parentDir}</pre>
        <div className="divide-x-2 flex justify-center">
          <div className="px-2 overflow-hidden">
            <pre className="truncate">
              {`Latest: `}
              <a
                href="#"
                className="text-blue-600 text-shadow-xs hover:text-blue-500"
                onClick={handleScrollToElement}
              >
                {currentUserLastPlayed}
              </a>
            </pre>
          </div>
          <div className="px-2 items-center">
            <UserListDialog
              dialogContainer={dialogContainer}
              setCurrentUserId={setCurrentUserId}
              setCurrentUserLastPlayed={setCurrentUserLastPlayed}
            />
          </div>
        </div>
      </div>
      <ScrollAreaCustom
        removeHighlight={removeHighlight}
        className="h-full w-full p-2 flex-1 overflow-hidden"
      >
        {pdfList?.map((dir) => (
          <div
            key={dir.fullPath}
            ref={(node) => {
              if (!node) pdfRefs.current.delete(dir.path)
              else pdfRefs.current.set(dir.path, node)
            }}
            className="py-2 pl-1 min-w-0 flex justify-between truncate transition-colors duration-300"
          >
            <RenameFunc dirs={dir} reloadPdfList={reloadPdfList} />
            <div className="text-blue-600 flex gap-2 text-xl">
              <PdfDialog
                fileName={dir.path}
                filePath={dir.fullPath}
                dialogContainer={dialogContainer}
                pdfBtnOnClick={() => {
                  handlePdfBtnClicked(dir.path)
                }}
              />
              <button
                type="button"
                className="cursor-pointer text-shadow-xs hover:text-blue-500"
                onClick={() => handleSaveUserLastPlayed(dir.path)}
              >
                <i className="fa-solid fa-floppy-disk" />
              </button>
              <button
                type="button"
                className="cursor-pointer text-shadow-xs hover:text-blue-500"
                onClick={() => handleDeleteFile(dir)}
              >
                <i className="fa-solid fa-trash-can" />
              </button>
            </div>
          </div>
        ))}
      </ScrollAreaCustom>
    </div>
  )
}

export default RightPanel

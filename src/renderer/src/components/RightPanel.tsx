import type { PathFullPath } from '@shared/types'
import { useCallback, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { User } from '@shared/types'
import { Spinner } from './ui/spinner'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group'
import { Button } from './ui/button'
import ScrollAreaCustom from './ScrollAreaCustom'
import PdfDialog from './PdfDialog'
import RenameFunc from './RenameFunc'

function RightPanel({
  parentDir,
  pdfList,
  reloadPdfList
}: {
  parentDir: string
  pdfList: PathFullPath[]
  reloadPdfList: () => Promise<void>
}): React.JSX.Element {
  const [userList, setUserList] = useState<User[] | null>(null)
  const [userDialogOpen, setUserDialogOpen] = useState<boolean>(false)
  const [loadingUserList, setLoadingUserList] = useState<boolean>(true)

  const [currentUserId, setCurrentUserId] = useState<number>(-1)
  const [currentUserLastPlayed, setCurrentUserLastPlayed] = useState<string>('<none>')

  const [currentRow, setCurrentRow] = useState<HTMLDivElement | null>(null)

  const pdfRefs = useRef(new Map<string, HTMLDivElement>())
  const removeHighlightFired = useRef<boolean>(false)

  const handleDbGetUsers = useCallback(async () => {
    const response = await window.api.dbGetUsers()
    setUserList(response)

    setLoadingUserList(false)
  }, [])

  const handleDbGetUserLastPlayed = useCallback(async (userId: number) => {
    setLoadingUserList(true)
    const userLastPlayed = await window.api.dbGetUserLastPlayed(userId)
    if (userLastPlayed) {
      setCurrentUserLastPlayed(userLastPlayed.LAST_PLAYED)
      setCurrentUserId(userLastPlayed.ID)
    }
    setUserDialogOpen(false)
  }, [])

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

  const handleDialogOpen = useCallback(
    async (open: boolean) => {
      setUserDialogOpen(open)
      if (open) {
        setLoadingUserList(true)
        handleDbGetUsers()
      }
    },
    [handleDbGetUsers]
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
            <Dialog open={userDialogOpen} onOpenChange={handleDialogOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer text-blue-600 text-shadow-xs hover:text-blue-500"
                >
                  <i className="fa-solid fa-download" />
                </button>
              </DialogTrigger>

              <DialogContent className="bg-gray-200 **:data-[slot=dialog-close]:hidden">
                <DialogHeader>
                  <DialogTitle>User List</DialogTitle>
                </DialogHeader>
                {loadingUserList && (
                  <div className="flex justify-center">
                    <Spinner className="size-6" />
                  </div>
                )}
                {!loadingUserList && (
                  <div className="flex flex-col gap-2 items-center">
                    <InputGroup className="bg-white">
                      <InputGroupInput placeholder="Enter username to add..." />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="default"
                          className="cursor-pointer rounded-md text-white bg-black"
                          disabled={true}
                        >
                          Add User
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <ScrollAreaCustom className="max-h-80 w-full overflow-hidden">
                      {userList?.map((user) => (
                        <div key={user.ID} className="min-w-0 truncate">
                          <Button
                            className="p-0 cursor-pointer text-md font-bold text-blue-600 text-shadow-xs hover:text-blue-500"
                            onClick={() => handleDbGetUserLastPlayed(user.ID)}
                          >
                            {user.NAME}
                          </Button>
                        </div>
                      ))}
                    </ScrollAreaCustom>
                  </div>
                )}
              </DialogContent>
            </Dialog>
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

import type { PathFullPath } from '@shared/types'
import { useCallback, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { User } from '@shared/types'
import { Spinner } from './ui/spinner'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group'
import { Button } from './ui/button'
import { ContextMenuItem } from './ui/context-menu'
import ScrollAreaCustom from './ScrollAreaCustom'
import PdfDialog from './PdfDialog'
import ContextMenuCustom from './ContextMenuCustom'

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

  const pdfRefs = useRef(new Map<string, HTMLDivElement>())
  const viewportRef = useRef<HTMLDivElement | null>(null)

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
        const saveHappened = await window.api.dbSaveUserLastPlayed(currentUserId, lastPlayed)
        if (saveHappened) setCurrentUserLastPlayed(lastPlayed)
      } catch (error) {
        console.error(error)
        return
      }
    },
    [currentUserId]
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
    const viewport = viewportRef.current
    const element = pdfRefs.current.get(currentUserLastPlayed)
    if (!viewport || !element) return

    // Compute element top relative to viewport scroll container
    // MUST BE element.top MINUS viewport.top
    const delta = element.getBoundingClientRect().top - viewport.getBoundingClientRect().top

    // element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    element.classList.add('bg-red-400')
    viewport.scrollTo({
      top: viewport.scrollTop + delta,
      behavior: 'smooth'
    })
  }, [currentUserLastPlayed])

  const removeHighlight = useCallback(() => {
    const element = pdfRefs.current.get(currentUserLastPlayed)
    if (element) setTimeout(() => element?.classList.remove('bg-red-400'), 5000)
  }, [currentUserLastPlayed])

  // no idea why adding "min-h-0" to the parent div works
  return (
    <div className="min-h-0 w-full flex flex-col">
      <div className="m-1 p-2 border-2 rounded-md text-center text-lg font-bold bg-gray-50">
        <pre className="truncate">{parentDir}</pre>
        <div className="divide-x-2 flex justify-center">
          <div className="px-2">
            <pre>
              {`Latest: `}
              <a href="#" className="text-blue-600" onClick={handleScrollToElement}>
                {currentUserLastPlayed}
              </a>
            </pre>
          </div>
          <div className="px-2 items-center">
            <Dialog open={userDialogOpen} onOpenChange={handleDialogOpen}>
              <DialogTrigger asChild>
                <button type="button" className="cursor-pointer text-blue-600">
                  {/* <pre>GET</pre> */}
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
                            className="p-0 cursor-pointer text-md text-blue-600 font-bold"
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
        viewportRef={viewportRef}
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
            className={[
              'py-2',
              'pl-1',
              'min-w-0',
              'flex',
              'justify-between',
              'truncate',
              'transition-colors',
              'duration-300'
            ].join(' ')}
          >
            <RenameFunc dirs={dir} reloadPdfList={reloadPdfList} />
            <div className="text-blue-600 flex gap-2 text-xl">
              <PdfDialog fileName={dir.path} filePath={dir.fullPath} />
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => handleSaveUserLastPlayed(dir.path)}
              >
                <i className="fa-solid fa-floppy-disk" />
              </button>
              <button type="button" className="cursor-pointer">
                <i className="fa-solid fa-trash-can" />
              </button>
            </div>
          </div>
        ))}
      </ScrollAreaCustom>
    </div>
  )
}

function RenameFunc({
  dirs,
  reloadPdfList
}: {
  dirs: PathFullPath
  reloadPdfList: () => Promise<void>
}): React.JSX.Element {
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false)
  const [currentNewName, setCurrentNewName] = useState<string>(dirs.path.replace(/\.pdf$/, ''))

  const handleRenameFile = useCallback(async () => {
    try {
      await window.api.renameFile(dirs.fullPath, currentNewName)
    } catch (error) {
      console.error(error)
    } finally {
      setRenameDialogOpen(false)
      reloadPdfList()
    }
  }, [dirs.fullPath, currentNewName, reloadPdfList])

  return (
    <>
      <ContextMenuCustom label={dirs.path}>
        <ContextMenuItem
          className="hover:bg-gray-100"
          onClick={() => {
            setRenameDialogOpen(true)
          }}
        >
          Rename
        </ContextMenuItem>
      </ContextMenuCustom>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="bg-gray-200">
          <DialogHeader>
            <DialogTitle>{`Rename File: ${dirs.path}`}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{`Enter new file name (without extension)`}</DialogDescription>
          <InputGroup className="bg-white">
            <InputGroupInput
              placeholder="Rename file to..."
              value={currentNewName}
              onChange={(e) => setCurrentNewName(e.target.value.trim())}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="default"
                className="cursor-pointer rounded-md text-white bg-black"
                disabled={!currentNewName}
                onClick={handleRenameFile}
              >
                Rename
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RightPanel

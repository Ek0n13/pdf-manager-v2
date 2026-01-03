import { PathFullPath } from '@shared/types'
import ContextMenuCustom from './ContextMenuCustom'
import { ContextMenuItem } from './ui/context-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group'
import { useCallback, useMemo, useState } from 'react'

function RenameFunc({
  dirs,
  reloadPdfList
}: {
  dirs: PathFullPath
  reloadPdfList: () => Promise<void>
}): React.JSX.Element {
  const oldName = useMemo<string>(() => dirs.path.replace(/\.pdf$/, ''), [dirs])

  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false)
  const [currentNewName, setCurrentNewName] = useState<string>(oldName)

  const handleRenameFile = useCallback(async () => {
    try {
      const trimmedNewName = currentNewName.trim()
      await window.api.renameFile(dirs.fullPath, trimmedNewName)
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

      <Dialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open)
          setCurrentNewName(oldName)
        }}
      >
        <DialogContent className="bg-gray-200">
          <DialogHeader className="overflow-hidden text-ellipsis line-clamp-2">
            <DialogTitle className="text-ellipsis line-clamp-2">{`Rename File: ${dirs.path}`}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{`Enter new file name (without extension)`}</DialogDescription>
          <InputGroup className="bg-white">
            <InputGroupInput
              spellCheck={false}
              placeholder="Rename file to..."
              value={currentNewName}
              onChange={(e) => setCurrentNewName(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleRenameFile()
                }
              }}
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

export default RenameFunc

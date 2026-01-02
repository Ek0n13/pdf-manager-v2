import { PathFullPath } from '@shared/types'
import ContextMenuCustom from './ContextMenuCustom'
import { ContextMenuItem } from './ui/context-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group'
import { useCallback, useState } from 'react'

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

export default RenameFunc

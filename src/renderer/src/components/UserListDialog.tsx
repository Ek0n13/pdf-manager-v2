import { useCallback, useState } from 'react'
import ScrollAreaCustom from './ScrollAreaCustom'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from './ui/input-group'
import { Spinner } from './ui/spinner'
import { User } from '@shared/types'

function UserListDialog({
  dialogContainer,
  setCurrentUserId,
  setCurrentUserLastPlayed
}: {
  dialogContainer?: React.RefObject<HTMLDivElement | null>
  setCurrentUserId: React.Dispatch<React.SetStateAction<number>>
  setCurrentUserLastPlayed: React.Dispatch<React.SetStateAction<string>>
}): React.JSX.Element {
  const [userDialogOpen, setUserDialogOpen] = useState<boolean>(false)

  const [userList, setUserList] = useState<User[] | null>(null)
  const [loadingUserList, setLoadingUserList] = useState<boolean>(true)

  const handleDbGetUsers = useCallback(async () => {
    const response = await window.api.dbGetUsers()
    setUserList(response)

    setLoadingUserList(false)
  }, [])

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

  const handleDbGetUserLastPlayed = useCallback(
    async (userId: number) => {
      setLoadingUserList(true)
      const userLastPlayed = await window.api.dbGetUserLastPlayed(userId)
      if (userLastPlayed) {
        setCurrentUserLastPlayed(userLastPlayed.LAST_PLAYED)
        setCurrentUserId(userLastPlayed.ID)
      }
      setUserDialogOpen(false)
    },
    [setCurrentUserId, setCurrentUserLastPlayed]
  )

  return (
    <Dialog open={userDialogOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer text-blue-600 text-shadow-xs hover:text-blue-500"
        >
          <i className="fa-solid fa-download" />
        </button>
      </DialogTrigger>

      <DialogContent
        className="bg-gray-200 **:data-[slot=dialog-close]:hidden"
        container={dialogContainer?.current}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement
          if (target.closest('[data-titlebar="true"]')) e.preventDefault()
        }}
      >
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
  )
}

export default UserListDialog

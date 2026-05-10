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

  const [newUserName, setNewUserName] = useState<string>('')

  const handleNewUserNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserName(event.target.value)
  }, [])

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

  const handleAddUserSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      setLoadingUserList(true)

      await window.api.dbAddUser(newUserName)
      handleDbGetUsers()
      setNewUserName('')
    },
    [newUserName, handleDbGetUsers]
  )

  const handleDbDeleteUser = useCallback(
    async (userId: number) => {
      await window.api.dbDeleteUser(userId)

      setLoadingUserList(true)

      handleDbGetUsers()
      setNewUserName('')
    },
    [handleDbGetUsers]
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
        {/* <iframe
          src="https://www.youtube.com/embed/mbUajSws-_o?rel=0&modestbranding=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe> */}
        {loadingUserList && (
          <div className="flex justify-center">
            <Spinner className="size-6" />
          </div>
        )}
        {!loadingUserList && (
          <div className="flex flex-col gap-2 items-center">
            <form className="w-full" onSubmit={handleAddUserSubmit}>
              <InputGroup className="bg-white">
                <InputGroupInput
                  required
                  pattern=".*\S.*"
                  value={newUserName}
                  onChange={handleNewUserNameChange}
                  placeholder="Enter username to add..."
                />
                <InputGroupAddon align="inline-end" className="mr-0">
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    className="cursor-pointer rounded-md text-white bg-black"
                    disabled={!newUserName.trim()}
                  >
                    Add User
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
            <ScrollAreaCustom className="pl-2 max-h-80 w-full overflow-hidden">
              {userList?.map((user) => (
                <div key={user.ID} className="flex min-w-0 justify-between">
                  <UserListButton
                    className="min-w-0 truncate"
                    onClick={() => handleDbGetUserLastPlayed(user.ID)}
                  >
                    {user.NAME}
                  </UserListButton>
                  <UserListButton onClick={() => handleDbDeleteUser(user.ID)}>
                    <i className="fa-solid fa-trash" />
                  </UserListButton>
                </div>
              ))}
            </ScrollAreaCustom>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function UserListButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.JSX.Element {
  return (
    <Button
      className={`p-0 cursor-pointer text-md font-bold text-blue-600 text-shadow-xs hover:text-blue-500 ${className ?? ''}`}
      {...props}
    >
      {children}
    </Button>
  )
}

export default UserListDialog

import type { PathFullPath } from '@shared/types'
import { ScrollAreaCustom } from './ScrollAreaCustom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { User } from '@shared/types'
import { useCallback, useState } from 'react'
import { Spinner } from './ui/spinner'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group'

export function RightPanel({
  parentDir,
  pdfList
}: {
  parentDir: string
  pdfList: PathFullPath[]
}): React.JSX.Element {
  const [userList, setUserList] = useState<User[] | null>(null)
  const [loadingUserList, setLoadingUserList] = useState<boolean>(true)

  const dbGetUsers = useCallback(async () => {
    const response = await window.api.dbGetUsers()
    setUserList(response)
    console.log(response)

    setLoadingUserList(false)
  }, [])
  // no idea why adding "min-h-0" to the parent div works
  return (
    <div className="min-h-0 w-full flex flex-col">
      <div className="m-1 p-2 border-2 rounded-md text-center text-lg font-bold">
        <pre className="truncate">{parentDir}</pre>
        <div className="divide-x-2 flex justify-center">
          <div className="px-2">
            <pre>
              {`Latest: `}
              <a href="#" className="text-blue-600">{`<none>`}</a>
            </pre>
          </div>
          <div className="px-2 items-center">
            <Dialog
              onOpenChange={(open) => {
                if (open) dbGetUsers()
              }}
            >
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
                    {/* <input type="text" className="px-2 py-1 w-full bg-white rounded-md ring-1" /> */}
                    <InputGroup className="bg-white">
                      <InputGroupInput placeholder="Enter username to add..." />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="default"
                          className="cursor-pointer rounded-md text-white bg-black"
                        >
                          Add User
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <ScrollAreaCustom className="max-h-80 w-full overflow-hidden">
                      {userList?.map((user) => (
                        <div key={user.ID} className="py-2 min-w-0 truncate">
                          <a href="#" className="text-blue-600 font-bold">
                            {user.NAME}
                          </a>
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
      <ScrollAreaCustom className="h-full w-full p-2 flex-1 overflow-hidden">
        {pdfList?.map((dir) => (
          <div key={dir.fullPath} className="py-2 min-w-0 flex justify-between truncate">
            <span>{dir.path}</span>
            <div className="text-blue-600 flex gap-2 text-xl">
              <PdfDialog />
              <button type="button" className="cursor-pointer">
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

function PdfDialog(): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="cursor-pointer">
          <i className="fa-solid fa-file-pdf" />
        </button>
      </DialogTrigger>

      <DialogContent className="min-h-[98%] min-w-[98%] bg-gray-200 **:data-[slot=dialog-close]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>User List</DialogTitle>
        </DialogHeader>
        <span>hello</span>
      </DialogContent>
    </Dialog>
  )
}

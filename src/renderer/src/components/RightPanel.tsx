import type { PathFullPath } from '@shared/types'
import { ScrollAreaCustom } from './ScrollAreaCustom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { User } from '@shared/types'
import { useCallback, useMemo, useState } from 'react'
import { Spinner } from './ui/spinner'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group'
// import { Document, Page, pdfjs } from 'react-pdf'

// import 'react-pdf/dist/Page/TextLayer.css'
// import 'react-pdf/dist/Page/AnnotationLayer.css'

// Vite-friendly worker wiring (ESM)
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url
// ).toString()

export function RightPanel({
  parentDir,
  pdfList
}: {
  parentDir: string
  pdfList: PathFullPath[]
}): React.JSX.Element {
  const [userList, setUserList] = useState<User[] | null>(null)
  const [loadingUserList, setLoadingUserList] = useState<boolean>(true)

  // const [userLastPlayed, setUserLastPlayed] = useState<string>('')

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
              <PdfDialog fileName={dir.path} filePath={dir.fullPath} />
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

function PdfDialog({
  filePath,
  fileName,
  ...props
}: { filePath: string; fileName: string } & React.ComponentProps<
  typeof Dialog
>): React.JSX.Element {
  const pdfUrl = useMemo(() => `app-pdf://local?path=${encodeURIComponent(filePath)}`, [filePath])

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <button type="button" className="cursor-pointer">
          <i className="fa-solid fa-file-pdf" />
        </button>
      </DialogTrigger>

      <DialogContent className="h-[98vh] min-w-[94vw] p-0 gap-0 flex flex-col overflow-hidden bg-gray-200 **:data-[slot=dialog-close]:cursor-pointer">
        <DialogHeader className="border-b-2 w-full p-4">
          <DialogTitle className="flex gap-4 divide-x-2">
            <button type="button" className="cursor-pointer pr-4 text-blue-600">
              {fileName}
            </button>
            <button
              type="button"
              className="cursor-pointer origin-center scale-150 rounded-md text-red-600 hover:text-blue-600"
            >
              <i className="fa-brands fa-youtube " />
            </button>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className="flex-1 h-full w-full rounded-b-md">
          <embed
            src={`${pdfUrl}#toolbar=0&view=FitH`}
            type="application/pdf"
            className="h-full w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

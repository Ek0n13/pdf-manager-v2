import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { MouseEventHandler, useCallback, useMemo } from 'react'

function PdfDialog({
  filePath,
  fileName,
  pdfBtnOnClick,
  ...props
}: {
  filePath: string
  fileName: string
  pdfBtnOnClick?: MouseEventHandler<HTMLButtonElement>
} & React.ComponentProps<typeof Dialog>): React.JSX.Element {
  const pdfUrl = useMemo(() => `app-pdf://local?path=${encodeURIComponent(filePath)}`, [filePath])

  const handleShowFile = useCallback((fullPath: string) => {
    window.api.showFile(fullPath)
  }, [])

  const handleWindowMinimize = useCallback(() => {
    window.api.windowMinimize()
  }, [])

  const handleYtSearchFilename = useCallback(async (fullPath: string) => {
    await window.api.ytSearchFilename(fullPath)
  }, [])

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer text-shadow-xs hover:text-blue-500"
          onClick={pdfBtnOnClick}
        >
          <i className="fa-solid fa-file-pdf" />
        </button>
      </DialogTrigger>

      <DialogContent
        className="h-[98vh] min-w-[98vw] p-0 gap-0 flex flex-col overflow-hidden bg-gray-200 **:data-[slot=dialog-close]:cursor-pointer"
        showCloseButton={false}
      >
        <DialogHeader className="border-b-2">
          <div className="flex justify-between">
            <div className="flex gap-4 divide-x-2">
              <button
                type="button"
                className="p-3 cursor-pointer pr-4"
                onClick={() => handleShowFile(filePath)}
              >
                <DialogTitle className="text-blue-600">{fileName}</DialogTitle>
              </button>
              <button
                type="button"
                className="cursor-pointer origin-center scale-150 rounded-md text-red-600 hover:text-blue-600"
                onClick={() => handleYtSearchFilename(fileName)}
              >
                <i className="fa-brands fa-youtube fa-xl" />
              </button>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                className="cursor-pointer py-2 px-4 hover:bg-neutral-400"
                onClick={handleWindowMinimize}
              >
                <i className="fa-solid fa-window-minimize" />
              </button>
              <DialogClose className="py-2 px-4 hover:bg-red-400">
                <i className="fa-solid fa-xmark" />
              </DialogClose>
            </div>
          </div>
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

export default PdfDialog

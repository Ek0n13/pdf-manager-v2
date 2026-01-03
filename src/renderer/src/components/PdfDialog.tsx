import {
  Dialog,
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

      <DialogContent className="h-[98vh] min-w-[98vw] p-0 gap-0 flex flex-col overflow-hidden bg-gray-200 **:data-[slot=dialog-close]:cursor-pointer">
        <DialogHeader className="border-b-2 w-full p-4">
          <DialogTitle className="flex gap-4 divide-x-2">
            <button type="button" className="cursor-pointer pr-4 text-blue-600">
              {fileName}
            </button>
            <button
              type="button"
              className="cursor-pointer origin-center scale-150 rounded-md text-red-600 hover:text-blue-600"
              onClick={() => handleYtSearchFilename(fileName)}
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

export default PdfDialog

// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
import { useCallback, useState } from 'react'
import { Button } from './components/ui/button'
import { ScrollArea } from './components/ui/scroll-area'

function App(): React.JSX.Element {
  const [currentParentDirectory, setCurrentParentDirectory] = useState<string | null>(null)
  const [currentSubDirectories, setCurrentSubDirectories] = useState<
    { path: string; fullPath: string }[] | null
  >(null)
  const [currentPdfList, setCurrentPdfList] = useState<{ path: string; fullPath: string }[]>([])

  const handleChooseDirectory = useCallback(async () => {
    const dir = await window.api.chooseDirectory()
    if (dir) {
      setCurrentParentDirectory(dir)
    }
  }, [])

  const handleGetSubDirectories = useCallback(async () => {
    if (!currentParentDirectory) return
    const dirs = await window.api.getSubDirectories(currentParentDirectory)
    console.log(dirs)
    if (!dirs) return
    setCurrentSubDirectories(dirs)
  }, [currentParentDirectory])

  const handleGetPdfList = useCallback(async (directory: string) => {
    const list = await window.api.getPdfList(directory)
    if (!list) return
    setCurrentPdfList(list)
  }, [])

  const stdContainerClasses = 'h-full p-2 flex flex-col bg-gray-200 shadow-md ring-1 min-w-0'
  const stdBtnClasses = 'cursor-pointer flex-1 not-lg:py-6 bg-black text-white whitespace-normal'
  return (
    <div className="h-screen w-full p-2 flex items-center justify-center">
      {/* two outer containers to center the gray areas*/}
      <div className="h-full w-full max-w-270 flex">
        {/* left parent */}
        <div className={`flex-1 rounded-s-md ${stdContainerClasses}`}>
          <div className="p-1 flex justify-center gap-1">
            <Button variant={'outline'} className={stdBtnClasses} onClick={handleChooseDirectory}>
              Choose Folder
            </Button>
            <Button
              variant={'outline'}
              className={stdBtnClasses}
              disabled={!currentParentDirectory}
              onClick={handleGetSubDirectories}
            >
              Get SubFolders
            </Button>
          </div>
          {currentParentDirectory && (
            <div className="min-h-0 w-full flex-1 flex flex-col">
              <code className="m-1 p-2 border-2 rounded-md text-center text-lg font-bold line-clamp-1">{`Current Folder: ${currentParentDirectory?.split('\\').splice(-1)[0]}`}</code>
              <div className="h-full w-full p-2 flex-1 overflow-hidden">
                <ScrollArea
                  type="auto"
                  className={`
                    **:data-[slot=scroll-area-scrollbar]:rounded-md
                    **:data-[slot=scroll-area-scrollbar]:bg-gray-300
                    **:data-[slot=scroll-area-thumb]:bg-black
                  `}
                >
                  <div className="pr-4 divide-y divide-black min-w-0">
                    {currentSubDirectories?.map((dir) => (
                      <div key={dir.fullPath} className="py-2 min-w-0 truncate">
                        <a
                          href="#"
                          className="text-blue-600 font-bold"
                          onClick={() => handleGetPdfList(dir.fullPath)}
                        >
                          {dir.path}
                        </a>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
        {/* right parent */}
        <div className={`flex-2 rounded-e-md ${stdContainerClasses}`}>
          <PdfList pdfList={currentPdfList} />
        </div>
      </div>
    </div>
  )
}

function PdfList({
  pdfList
}: {
  pdfList: { path: string; fullPath: string }[]
}): React.JSX.Element {
  return (
    <div>
      <ul>
        {pdfList.map((pdf) => (
          <li key={pdf.fullPath}>{pdf.path}</li>
        ))}
      </ul>
    </div>
  )
}

export default App

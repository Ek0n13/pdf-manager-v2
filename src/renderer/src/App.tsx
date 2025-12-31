// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
import { useCallback, useState } from 'react'
import { Button } from './components/ui/button'
import { ScrollAreaCustom } from './components/ScrollAreaCustom'
import { RightPanel } from './components/RightPanel'
import type { PathFullPath } from '@shared/types'

function App(): React.JSX.Element {
  const [currentParentDirectory, setCurrentParentDirectory] = useState<string>('')
  const [currentSubDirectories, setCurrentSubDirectories] = useState<PathFullPath[]>([])
  const [currentPdfList, setCurrentPdfList] = useState<PathFullPath[]>([])

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
    // setCurrentSubDirectories(dirs)
    setCurrentSubDirectories(Array(20).fill(dirs).flat())
  }, [currentParentDirectory])

  const handleGetPdfList = useCallback(async (directory: string) => {
    const list = await window.api.getPdfList(directory)
    if (!list) return
    setCurrentPdfList(list)
  }, [])

  const stdContainerClasses = 'h-full p-2 flex flex-col bg-gray-200 shadow-md ring-1 min-w-0'
  const stdBtnClasses = 'cursor-pointer flex-1 not-lg:py-6 bg-black text-white whitespace-normal'
  return (
    <div className="h-screen w-full p-2 flex items-center justify-center bg-gray-100">
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
              <pre className="m-1 p-2 border-2 rounded-md text-center text-lg font-bold line-clamp-1">{`Current Folder: ${currentParentDirectory?.split('\\').splice(-1)[0]}`}</pre>
              <ScrollAreaCustom className="h-full w-full p-2 flex-1 overflow-hidden">
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
              </ScrollAreaCustom>
            </div>
          )}
        </div>
        {/* right parent */}
        <div className={`flex-2 rounded-e-md ${stdContainerClasses}`}>
          {currentPdfList.length > 0 && (
            <RightPanel parentDir={currentParentDirectory} pdfList={currentPdfList} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App

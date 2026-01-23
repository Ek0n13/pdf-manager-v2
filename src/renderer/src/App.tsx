// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
import { CSSProperties, useCallback, useEffect, useState } from 'react'
import { Button } from './components/ui/button'
import ScrollAreaCustom from './components/ScrollAreaCustom'
import RightPanel from './components/RightPanel'
import type { PathFullPath } from '@shared/types'
import icon from './assets/icon.png'

function App(): React.JSX.Element {
  const [currentParentDirectory, setCurrentParentDirectory] = useState<string>('')
  const [currentSubDirectories, setCurrentSubDirectories] = useState<PathFullPath[]>([])
  const [currentPdfDirectory, setCurrentPdfDirectory] = useState<string>('')
  const [currentPdfList, setCurrentPdfList] = useState<PathFullPath[]>([])

  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(false)

  useEffect(() => {
    window.api.isMaximized().then(setIsWindowMaximized)

    window.api.onMaximize(() => setIsWindowMaximized(true))
    window.api.onUnmaximize(() => setIsWindowMaximized(false))

    return () => {
      window.api.removeMaximizeListeners()
    }
  }, [])

  const handleWindowMinimize = useCallback(() => {
    window.api.windowMinimize()
  }, [])
  const handleWindowMaximize = useCallback(() => {
    window.api.windowMaximize()
    window.api.isMaximized().then(setIsWindowMaximized)
  }, [])
  const handleWindowClose = useCallback(() => {
    window.api.windowClose()
  }, [])

  const handleChooseDirectory = useCallback(async () => {
    const dir = await window.api.chooseDirectory()
    if (dir) {
      setCurrentParentDirectory(dir)
    }
  }, [])

  const handleGetSubDirectories = useCallback(async () => {
    if (!currentParentDirectory) return
    const dirs = await window.api.getSubDirectories(currentParentDirectory)
    if (!dirs) return
    // setCurrentSubDirectories(dirs)
    setCurrentSubDirectories(Array(1).fill(dirs).flat())
  }, [currentParentDirectory])

  const handleGetPdfList = useCallback(async (directory: string) => {
    const list = await window.api.getPdfList(directory)
    if (!list) return
    setCurrentPdfList(list)
    setCurrentPdfDirectory(directory)
  }, [])

  const reloadPdfList = useCallback(async () => {
    const list = await window.api.getPdfList(currentPdfDirectory)
    if (!list) return
    setCurrentPdfList(list)
  }, [currentPdfDirectory])

  const stdContainerClasses = 'h-full p-2 flex flex-col bg-gray-300 shadow-md ring-1 min-w-0'
  const stdBtnClasses = 'cursor-pointer flex-1 not-lg:py-6 bg-black text-white whitespace-normal'
  return (
    <div className="h-screen flex flex-col divide-y bg-gray-100">
      <div
        className="h-9 flex justify-between bg-neutral-800 text-white"
        style={{ '-webkit-app-region': 'drag' } as CSSProperties}
      >
        <div
          className="px-2 py-2 flex gap-x-2 items-center"
          // style={{ '-webkit-app-region': 'drag' } as CSSProperties}
        >
          <img src={icon} className="w-5 h-5" />
          <span>PDF Manager v2</span>
        </div>
        <div
          className="px-2 h-full flex gap-2"
          style={{ '-webkit-app-region': 'no-drag' } as CSSProperties}
        >
          <button className="px-2 rounded-md hover:bg-neutral-400" onClick={handleWindowMinimize}>
            <i className="fa-solid fa-window-minimize" />
          </button>
          <button className="px-2 rounded-md hover:bg-neutral-400" onClick={handleWindowMaximize}>
            {isWindowMaximized ? (
              <i className="fa-solid fa-compress" />
            ) : (
              <i className="fa-solid fa-expand" />
            )}
          </button>
          <button className="px-2 rounded-md hover:bg-neutral-400" onClick={handleWindowClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>
      <div className="h-full w-full p-2 flex items-center justify-center">
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
                <pre className="m-1 p-2 border-2 rounded-md text-center text-lg font-bold line-clamp-1 bg-gray-50">{`Current Folder: ${currentParentDirectory?.split('\\').splice(-1)[0]}`}</pre>
                <ScrollAreaCustom className="h-full w-full p-2 flex-1 overflow-hidden">
                  {currentSubDirectories?.map((dir) => (
                    <div key={dir.fullPath} className="py-2 min-w-0 truncate">
                      <a
                        href="#"
                        className="text-blue-600 font-bold text-shadow-xs hover:text-blue-500"
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
              <RightPanel
                parentDir={currentParentDirectory}
                pdfList={currentPdfList}
                reloadPdfList={reloadPdfList}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
import { useState } from 'react'
import { Button } from './components/ui/button'
import { ScrollArea } from './components/ui/scroll-area'

function App(): React.JSX.Element {
  const [currentParentDirectory, setCurrentParentDirectory] = useState<string | null>(null)

  const handleChooseDirectory = async (): Promise<void> => {
    const dir = await window.api.chooseDirectory()

    if (dir) {
      setCurrentParentDirectory(dir)
    }
  }

  const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`)

  const stdContainerClasses = 'h-full p-2 flex flex-col bg-gray-200 rounded-md'
  const stdBtnClasses = 'flex-1 not-lg:py-6 bg-black text-white whitespace-normal'
  return (
    <div className="h-screen w-full p-2 flex items-center justify-center">
      {/* two outer containers to center the gray areas*/}
      <div className="h-full w-full max-w-270 flex gap-2">
        {/* left parent */}
        <div className={`flex-1 ${stdContainerClasses}`}>
          <div className="p-1 flex justify-center gap-1">
            <Button variant={'outline'} className={stdBtnClasses} onClick={handleChooseDirectory}>
              Choose Folder
            </Button>
            <Button variant={'outline'} className={stdBtnClasses}>
              Get SubFolders
            </Button>
          </div>
          {!currentParentDirectory && (
            <div className="min-h-0 flex-1 flex flex-col">
              <code className="m-1 p-2 border-2 rounded-md text-center text-lg font-bold line-clamp-1">{`Current Folder: ${currentParentDirectory?.split('\\').splice(-1)[0]}`}</code>
              <div className="p-2 flex-1 h-full overflow-y-hidden">
                <ScrollArea
                  type="auto"
                  className={`
                    flex-1
                    h-full
                    overflow-y-hidden 
                    **:data-[slot=scroll-area-scrollbar]:rounded-md
                    **:data-[slot=scroll-area-scrollbar]:bg-gray-300
                    **:data-[slot=scroll-area-thumb]:bg-black
                  `}
                >
                  <div className="px-4 divide-y divide-black">
                    {tags.map((tag) => (
                      <div key={tag} className="p-2">
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
        {/* right parent */}
        <div className={`flex-2 ${stdContainerClasses}`}>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
          <span>hello</span>
        </div>
      </div>
    </div>
  )
}

export default App

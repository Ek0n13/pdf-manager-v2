// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
import { Button } from './components/ui/button'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const stdContainerClasses = 'h-full p-2 flex flex-col bg-gray-200 rounded-md'
  const stdBtnClasses = 'flex-1 not-lg:py-6 bg-black text-white whitespace-normal'
  return (
    <div className="h-screen w-full p-2 flex items-center justify-center gap-2">
      <div className={`flex-1 ${stdContainerClasses}`}>
        <div className="p-1 flex justify-center gap-1">
          <Button variant={'outline'} className={stdBtnClasses}>
            Choose Folder
          </Button>
          <Button variant={'outline'} className={stdBtnClasses}>
            Get SubFolders
          </Button>
        </div>
        <span>hello</span>
        <span>hello</span>
        <span>hello</span>
      </div>
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
  )
}

export default App

// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const stdContainerClasses = 'h-full p-2 flex flex-col bg-gray-200 rounded-md'
  return (
    <div className="h-screen w-full p-2 flex items-center justify-center gap-2">
      <div className={`flex-1 ${stdContainerClasses}`}>
        <span>hello</span>
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

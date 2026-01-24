import { CSSProperties, useCallback, useEffect, useState } from 'react'
import icon from '@renderer/assets/icon.png'

function TitleBar(): React.JSX.Element {
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

  return (
    <div
      className="h-8 flex justify-between bg-neutral-800 text-white"
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
    >
      <div
        className="px-2 py-2 flex gap-x-2 items-center"
        // style={{ '-webkit-app-region': 'drag' } as CSSProperties}
      >
        <img src={icon} className="w-5 h-5" />
        <span>PDF Manager v2</span>
      </div>
      <div className="h-full flex" style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}>
        <button className="px-3 hover:bg-neutral-400" onClick={handleWindowMinimize}>
          <i className="fa-solid fa-window-minimize" />
        </button>
        <button className="px-3 hover:bg-neutral-400" onClick={handleWindowMaximize}>
          {isWindowMaximized ? (
            <i className="fa-solid fa-compress" />
          ) : (
            <i className="fa-solid fa-expand" />
          )}
        </button>
        <button className="px-3 hover:bg-red-400" onClick={handleWindowClose}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  )
}

export default TitleBar

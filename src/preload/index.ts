import { contextBridge, IpcMainInvokeEvent, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
export const api = {
  chooseDirectory: async (): Promise<string | null> => ipcRenderer.invoke('choose-directory'),
  getSubDirectories: async (
    _event: IpcMainInvokeEvent,
    parentDirectory: string
  ): Promise<string[] | null> => ipcRenderer.invoke('get-sub-directories', _event, parentDirectory)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

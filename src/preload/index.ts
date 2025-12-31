import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { PathFullPath, User } from '../shared/types'

// Custom APIs for renderer
export const api = {
  chooseDirectory: async (): Promise<string | null> => ipcRenderer.invoke('choose-directory'),
  getSubDirectories: async (parentDirectory: string): Promise<PathFullPath[] | null> =>
    ipcRenderer.invoke('get-sub-directories', parentDirectory),
  getPdfList: async (directory: string): Promise<PathFullPath[] | null> =>
    ipcRenderer.invoke('get-pdf-list', directory),
  dbGetUsers: async (): Promise<User[] | null> => ipcRenderer.invoke('db:get-users')
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

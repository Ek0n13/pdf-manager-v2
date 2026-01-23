import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { PathFullPath, User, UserLastPlayed } from '../shared/types'

// Custom APIs for renderer
export const api = {
  windowMinimize: (): void => ipcRenderer.send('window:minimize'),
  windowMaximize: (): void => ipcRenderer.send('window:maximize'),
  windowClose: (): void => ipcRenderer.send('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),

  onMaximize: (callback: () => void) => ipcRenderer.on('window:on-maximize', callback),
  onUnmaximize: (callback: () => void) => ipcRenderer.on('window:on-unmaximize', callback),
  removeMaximizeListeners: () => {
    ipcRenderer.removeAllListeners('window:on-maximize')
    ipcRenderer.removeAllListeners('window:on-unmaximize')
  },

  chooseDirectory: async (): Promise<string | null> => ipcRenderer.invoke('choose-directory'),
  getSubDirectories: async (parentDirectory: string): Promise<PathFullPath[] | null> =>
    ipcRenderer.invoke('get-sub-directories', parentDirectory),
  getPdfList: async (directory: string): Promise<PathFullPath[] | null> =>
    ipcRenderer.invoke('get-pdf-list', directory),
  getPdfBytes: async (filePath: string): Promise<Uint8Array> =>
    ipcRenderer.invoke('get-pdf-bytes', filePath),
  ytSearchFilename: async (fileName: string): Promise<void> =>
    ipcRenderer.invoke('yt:search-filename', fileName),
  renameFile: async (oldFilePath: string, newFileName: string): Promise<void> =>
    ipcRenderer.invoke('file:rename', oldFilePath, newFileName),
  deleteFile: async (pathFullPath: PathFullPath): Promise<boolean> =>
    ipcRenderer.invoke('file:delete', pathFullPath),
  dbGetUsers: async (): Promise<User[] | null> => ipcRenderer.invoke('db:get-users'),
  dbGetUserLastPlayed: async (userId: User['ID']): Promise<UserLastPlayed | null> =>
    ipcRenderer.invoke('db:get-user-last-played', userId),
  dbSaveUserLastPlayed: async (
    userId: UserLastPlayed['ID'],
    lastPlayed: UserLastPlayed['LAST_PLAYED']
  ): Promise<boolean> => ipcRenderer.invoke('db:save-user-last-played', userId, lastPlayed)
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

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type PdfFile = {
  name: string
  path: string
}

// Custom APIs for renderer
export const api = {
  chooseDirectory: async (): Promise<string | null> => ipcRenderer.invoke('choose-directory'),
  getSubDirectories: async (parentDirectory: string): Promise<string[] | null> =>
    ipcRenderer.invoke('get-sub-directories', parentDirectory),
  getPdfFiles: async (parentDirectory: string, subDirectory: string): Promise<PdfFile[] | null> =>
    ipcRenderer.invoke('get-pdf-files', parentDirectory, subDirectory),
  readPdfFile: async (filePath: string): Promise<Uint8Array | null> =>
    ipcRenderer.invoke('read-pdf-file', filePath),
  openExternal: async (url: string): Promise<void> => ipcRenderer.invoke('open-external', url),
  openFile: async (filePath: string): Promise<void> => ipcRenderer.invoke('open-file', filePath),
  revealInFolder: async (filePath: string): Promise<void> =>
    ipcRenderer.invoke('reveal-in-folder', filePath)
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

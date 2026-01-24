import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  promptDialog,
  chooseDirectory,
  getPdfList,
  getSubDirectories,
  dbGetUsers,
  ytSearchFilename,
  dbGetUserLastPlayed,
  dbSaveUserLastPlayed,
  renameFile,
  deleteFile,
  showFile
} from './main'
import { customHandle, customOn } from './tools'
import { registerPdfProtocol } from './pdf'
import { initAutoUpdate } from './autoUpdate'
import { loadRuntimeEnv } from './env'

let mainWindow: BrowserWindow | null = null
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // width: 896,
    // height: 504,
    width: 576 * 2,
    height: 1024,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.maximize()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // mainWindow.on('close', (event) => {
  //   const dialogResult = promptDialog('Are you sure you want to quit?')
  //   // if user chose no, do not close
  //   if (!dialogResult) event.preventDefault()
  // })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:on-maximize')
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:on-unmaximize')
  })
}

const readyFunction = (): void => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  loadRuntimeEnv()
  registerPdfProtocol()
  createWindow()
  initAutoUpdate()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // ipc functions
  customOn('window:minimize', () => {
    mainWindow?.minimize()
  })
  customOn('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow?.unmaximize()
      return
    }
    mainWindow?.maximize()
  })
  customOn('window:close', () => {
    const dialogResult = promptDialog('Are you sure you want to quit?')
    // if user chose no, do not close
    if (!dialogResult) return

    mainWindow?.close()
  })

  customHandle('window:is-maximized', () => {
    return mainWindow?.isMaximized()
  })

  customOn('show-file', showFile)

  customHandle('choose-directory', chooseDirectory)
  customHandle('get-sub-directories', getSubDirectories)
  customHandle('get-pdf-list', getPdfList)
  // customHandle('get-pdf-bytes', getPdfBytes)
  customHandle('yt:search-filename', ytSearchFilename)
  customHandle('file:rename', renameFile)
  customHandle('file:delete', deleteFile)
  customHandle('db:get-users', dbGetUsers)
  customHandle('db:get-user-last-played', dbGetUserLastPlayed)
  customHandle('db:save-user-last-played', dbSaveUserLastPlayed)
}

// 1. Request the lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 2. If we didn't get the lock, quit this new instance immediately
  app.quit()
} else {
  // 3. We have the lock! Listen for the 'second-instance' event
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      // Optional: You can handle commandLine arguments here if needed
    }
  })

  // 4. Continue with your standard initialization
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(readyFunction)
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

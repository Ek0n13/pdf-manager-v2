// src/main/autoUpdate.ts
import { app, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

export function initAutoUpdate(): void {
  // Don’t run updater in dev
  if (!app.isPackaged) return

  // Optional but strongly recommended for diagnostics
  autoUpdater.logger = log
  // ;(autoUpdater.logger as any).transports.file.level = 'info'

  // Typical UX: download automatically, then prompt to restart
  autoUpdater.autoDownload = true

  autoUpdater.on('error', (err) => {
    log.error('autoUpdater error', err)
  })

  autoUpdater.on('update-downloaded', async () => {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      message: 'An update has been downloaded.',
      detail: 'Restart the application to apply the updates.'
    })

    if (response === 0) autoUpdater.quitAndInstall()
  })

  // Fire-and-forget check (you can also do checkForUpdates() if you want full control)
  autoUpdater.checkForUpdatesAndNotify()
}

import { ipcMain, type IpcMainInvokeEvent } from 'electron'

type AsyncOrSync<T> = T | Promise<T>
type Fn<Args extends unknown[], R> = (...args: Args) => AsyncOrSync<R>

export function customHandle<Args extends unknown[], R>(channel: string, fn: Fn<Args, R>): void {
  ipcMain.handle(channel, (_event: IpcMainInvokeEvent, ...args: Args) => fn(...args))
}

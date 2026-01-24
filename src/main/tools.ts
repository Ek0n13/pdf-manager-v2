import { ipcMain, type IpcMainInvokeEvent } from 'electron'

type AsyncOrSync<T> = T | Promise<T>
type Fn<Args extends unknown[], R> = (...args: Args) => AsyncOrSync<R>

export function customHandle<Args extends unknown[], R>(channel: string, fn: Fn<Args, R>): void {
  ipcMain.handle(channel, (_event: IpcMainInvokeEvent, ...args: Args) => fn(...args))
}

export function customOn<Args extends unknown[], R>(channel: string, fn: Fn<Args, R>): void {
  ipcMain.on(channel, (_event: IpcMainInvokeEvent, ...args: Args) => fn(...args))
}

type Result<T, E = unknown> = readonly [data: T, error: null] | readonly [data: null, error: E]

export async function tryCatch<T, E = unknown>(fn: () => T | Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await fn()
    return [data, null] as const
  } catch (error) {
    return [null, error as E] as const
  }
}

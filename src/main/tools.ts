import { ipcMain, type IpcMainInvokeEvent } from 'electron'

import { Effect, Either } from 'effect'
import { FetchHttpClient, HttpClient } from '@effect/platform'

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

export type EffectResult<A, E> = { ok: true; value: A } | { ok: false; error: E }
export async function runEffect<A, E>(
  effect: Effect.Effect<A, E, HttpClient.HttpClient>
): Promise<EffectResult<A, E>> {
  const result = await Effect.runPromise(
    effect.pipe(Effect.either, Effect.provide(FetchHttpClient.layer))
  )
  return Either.isRight(result)
    ? { ok: true, value: result.right }
    : { ok: false, error: result.left }
}

import { dialog } from 'electron'
import { readdir } from 'fs/promises'
import { statSync } from 'fs'
import { join } from 'path'

export type PathFullPath = {
  path: string
  fullPath: string
}

type Result<T, E = unknown> = readonly [data: T, error: null] | readonly [data: null, error: E]

async function tryCatch<T, E = unknown>(fn: () => T | Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await fn()
    return [data, null] as const
  } catch (error) {
    return [null, error as E] as const
  }
}

function errorDialog(msg: string): void {
  dialog.showMessageBoxSync({
    message: msg,

    type: 'error',
    title: 'Error!'
  })
}

export async function chooseDirectory(): Promise<string | null> {
  try {
    const [data, error] = await tryCatch(() =>
      dialog.showOpenDialog({
        properties: ['openDirectory']
      })
    )

    if (data?.canceled) return null

    if (error) throw new Error(`${error}`)

    const result = data?.filePaths

    if (!result || result.length === 0) throw new Error(`No folder found or chosen.`)
    if (result.length > 1) throw new Error(`Choose only 1 folder.`)

    return result[0]
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

export async function getSubDirectories(parentDirectory: string): Promise<PathFullPath[] | null> {
  try {
    const [data, error] = await tryCatch(() => readdir(parentDirectory))
    if (error) throw new Error(`${error}`)

    const filteredData = data?.filter((v) => statSync(join(parentDirectory, v)).isDirectory())
    if (filteredData?.length === 0) throw new Error('No sub folders found.')

    const result = filteredData?.map((v) => ({
      path: v,
      fullPath: join(parentDirectory, v)
    }))

    return result ?? null
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

export async function getPdfList(directory: string): Promise<PathFullPath[] | null> {
  try {
    const [data, error] = await tryCatch(() => readdir(directory))
    if (error) throw new Error(`${error}`)

    const filteredData = data?.filter((v) => v.endsWith('.pdf'))
    if (filteredData?.length === 0) throw new Error('No files found.')

    const result = filteredData?.map((v) => ({
      path: v,
      fullPath: join(directory, v)
    }))

    return result ?? null
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

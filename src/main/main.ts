import { dialog, shell } from 'electron'
import { readdir } from 'fs/promises'
import { statSync } from 'fs'
import { join } from 'path'
import { tryCatch } from './tools'
import type { PathFullPath, User } from '../shared/types'
import { getUsers } from './oracledb'

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

export async function openLocalPath(filePath: string): Promise<void> {
  try {
    await shell.openPath(filePath)
  } catch (error) {
    errorDialog(`${error}`)
  }
}

// export async function getPdfBytes(filePath: string): Promise<Uint8Array> {
//   const buffer = await readFile(filePath)
//   return new Uint8Array(buffer)
// }

export async function dbGetUsers(): Promise<User[] | null> {
  try {
    const [data, error] = await tryCatch(() => getUsers())
    if (error) throw new Error(`${error}`)

    return data
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

import { dialog, shell } from 'electron'
import { readdir, rename } from 'fs/promises'
import { statSync, existsSync } from 'fs'
import { dirname, extname, format, join, parse } from 'path'
import { tryCatch } from './tools'
import type { PathFullPath, User, UserLastPlayed } from '../shared/types'
import { getUserLastPlayed, getUsers, saveUserLastPlayed } from './oracledb'
import { exec } from 'child_process'

function errorDialog(msg: string): void {
  dialog.showMessageBoxSync({
    message: msg,

    type: 'error',
    title: 'Error!'
  })
}

export function showFile(fullPath: string): void {
  shell.showItemInFolder(fullPath)
}

// returns true if "yes"
export function promptDialog(msg: string): boolean {
  const dialogResult = dialog.showMessageBoxSync({
    message: msg,

    type: 'question',
    buttons: ['Yes', 'No'],
    defaultId: 0,
    cancelId: 1,
    title: 'Confirm'
  })

  return dialogResult === 0
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

export async function ytSearchFilename(fileName: string): Promise<void> {
  const msedgePath = join(
    'C:',
    'Program Files (x86)',
    'Microsoft',
    'Edge',
    'Application',
    'msedge.exe'
  )

  try {
    const fileNameNoExt = parse(fileName).name.trim()
    const searchString = fileNameNoExt
      .replace(/&/g, '%26')
      .replace(/'/g, '')
      .replace(/"/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .replace(/ /g, '+') // specifically for searching in url params
    const url = `https://www.youtube.com/results?search_query=${searchString}+hq`

    if (!existsSync(msedgePath)) {
      const result = dialog.showMessageBoxSync({
        message: 'Microsoft Edge not found.\nOpen in default browser?',

        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1,
        title: 'Confirm Action'
      })

      if (result === 0) shell.openExternal(url)

      return
    }

    exec(`"${msedgePath}" "${url}"`)
  } catch (error) {
    errorDialog(`${error}`)
  }
}

export async function renameFile(oldFilePath: string, newFileName: string): Promise<void> {
  try {
    const isFile = statSync(oldFilePath).isFile()
    if (!isFile) throw new Error('Path is not a file')

    const parentDir = dirname(oldFilePath)
    const extension = extname(oldFilePath)
    const newFileNameExt = format({ name: newFileName, ext: extension })
    await rename(oldFilePath, join(parentDir, newFileNameExt))
  } catch (error) {
    errorDialog(`${error}`)
  }
}

export async function deleteFile(pathFullPath: PathFullPath): Promise<boolean> {
  try {
    const { path, fullPath } = pathFullPath
    const isFile = statSync(fullPath).isFile()
    if (!isFile) throw new Error('Path is not a file')

    const result = promptDialog(`Delete file: ${path}?`)
    if (!result) return false

    await shell.trashItem(fullPath)
    return true
  } catch (error) {
    errorDialog(`${error}`)
    return false
  }
}

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

export async function dbGetUserLastPlayed(userId: User['ID']): Promise<UserLastPlayed | null> {
  try {
    const [data, error] = await tryCatch(() => getUserLastPlayed(userId))
    if (error) throw new Error(`${error}`)

    return data
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

export async function dbSaveUserLastPlayed(
  userId: UserLastPlayed['ID'],
  lastPlayed: UserLastPlayed['LAST_PLAYED']
): Promise<boolean> {
  try {
    const result = promptDialog('Save last played?')
    if (!result) return false

    await saveUserLastPlayed(userId, lastPlayed)
    return true
  } catch (error) {
    errorDialog(`${error}`)
    return false
  }
}

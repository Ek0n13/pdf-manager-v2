import { dialog, IpcMainInvokeEvent } from 'electron'
import { readdir } from 'fs/promises'
import { statSync } from 'fs'
import { join } from 'path'

function errorDialog(msg: string): void {
  dialog.showMessageBoxSync({
    message: msg,

    type: 'error',
    title: 'Error!'
  })
}

export async function chooseDirectory(): Promise<string | null> {
  try {
    const response = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (response.canceled) return null

    const result = response.filePaths
    if (!result || result.length === 0) throw new Error('No folder found or chosen.')
    if (result.length > 1) throw new Error('Choose only 1 folder.')

    return result[0]
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

export async function getSubDirectories(
  _event: IpcMainInvokeEvent,
  parentDirectory: string
): Promise<string[] | null> {
  try {
    const response = await readdir(parentDirectory)

    const result = response.filter((v) => statSync(join(parentDirectory, v)).isDirectory())
    if (result.length === 0) throw new Error('No sub folders found.')

    return result
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

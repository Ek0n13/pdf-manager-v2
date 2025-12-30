import { dialog, IpcMainInvokeEvent, shell } from 'electron'
import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'

type PdfFile = {
  name: string
  path: string
}

let libraryRoot: string | null = null

function normalizePathForCompare(path: string): string {
  const resolvedPath = resolve(path)
  return process.platform === 'win32' ? resolvedPath.toLowerCase() : resolvedPath
}

function isPathInsideRoot(root: string, candidatePath: string): boolean {
  const resolvedRoot = resolve(root)
  const resolvedCandidate = resolve(candidatePath)
  const rootSep = resolvedRoot.endsWith('\\') || resolvedRoot.endsWith('/') ? resolvedRoot : resolvedRoot + '\\'

  if (process.platform === 'win32') {
    const rootLower = rootSep.toLowerCase()
    const candidateLower = resolvedCandidate.toLowerCase()
    return candidateLower === resolvedRoot.toLowerCase() || candidateLower.startsWith(rootLower)
  }

  const rootPosix = resolvedRoot.endsWith('/') ? resolvedRoot : resolvedRoot + '/'
  return resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(rootPosix)
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
    const response = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (response.canceled) return null

    const result = response.filePaths
    if (!result || result.length === 0) throw new Error('No folder found or chosen.')
    if (result.length > 1) throw new Error('Choose only 1 folder.')

    libraryRoot = result[0]
    return libraryRoot
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
    if (!libraryRoot) {
      libraryRoot = parentDirectory
    } else if (normalizePathForCompare(libraryRoot) !== normalizePathForCompare(parentDirectory)) {
      throw new Error('Library root mismatch.')
    }

    const response = await readdir(parentDirectory, { withFileTypes: true })
    const result = response.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    if (result.length === 0) throw new Error('No sub folders found.')

    return result
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

export async function getPdfFiles(
  _event: IpcMainInvokeEvent,
  parentDirectory: string,
  subDirectory: string
): Promise<PdfFile[] | null> {
  try {
    if (!libraryRoot) {
      libraryRoot = parentDirectory
    } else if (normalizePathForCompare(libraryRoot) !== normalizePathForCompare(parentDirectory)) {
      throw new Error('Library root mismatch.')
    }

    const dirPath = resolve(parentDirectory, subDirectory)
    if (!isPathInsideRoot(parentDirectory, dirPath)) throw new Error('Invalid folder path.')

    const entries = await readdir(dirPath, { withFileTypes: true })
    const pdfs = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
      .map((entry) => ({
        name: entry.name,
        path: join(dirPath, entry.name)
      }))

    return pdfs
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

export async function readPdfFile(
  _event: IpcMainInvokeEvent,
  filePath: string
): Promise<Uint8Array | null> {
  try {
    if (!libraryRoot) throw new Error('No library selected.')
    if (!filePath.toLowerCase().endsWith('.pdf')) throw new Error('Only PDF files are supported.')
    if (!isPathInsideRoot(libraryRoot, filePath)) throw new Error('Invalid file path.')

    const data = await readFile(filePath)
    return data
  } catch (error) {
    errorDialog(`${error}`)
    return null
  }
}

export async function openExternal(_event: IpcMainInvokeEvent, url: string): Promise<void> {
  try {
    const parsed = new URL(url)
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Unsupported URL.')
    await shell.openExternal(url)
  } catch (error) {
    errorDialog(`${error}`)
  }
}

export async function openFile(_event: IpcMainInvokeEvent, filePath: string): Promise<void> {
  try {
    if (!libraryRoot) throw new Error('No library selected.')
    if (!isPathInsideRoot(libraryRoot, filePath)) throw new Error('Invalid file path.')

    const result = await shell.openPath(filePath)
    if (result) throw new Error(result)
  } catch (error) {
    errorDialog(`${error}`)
  }
}

export async function revealInFolder(_event: IpcMainInvokeEvent, filePath: string): Promise<void> {
  try {
    if (!libraryRoot) throw new Error('No library selected.')
    if (!isPathInsideRoot(libraryRoot, filePath)) throw new Error('Invalid file path.')

    shell.showItemInFolder(filePath)
  } catch (error) {
    errorDialog(`${error}`)
  }
}

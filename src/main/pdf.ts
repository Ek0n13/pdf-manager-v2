import { net, protocol } from 'electron'
import { pathToFileURL } from 'node:url'
import fs from 'node:fs'

// Must be called before app is ready, so do it at module load.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app-pdf',
    privileges: {
      standard: true,
      secure: true,
      stream: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

export function registerPdfProtocol(): void {
  protocol.handle('app-pdf', async (request) => {
    const url = new URL(request.url)

    // app-pdf://local?path=/absolute/path/to/file.pdf
    const filePath = url.searchParams.get('path')
    if (!filePath) {
      return new Response('Missing path', { status: 400 })
    }

    // Minimal check to avoid confusing errors (remove if you truly do not care).
    if (!filePath.toLowerCase().endsWith('.pdf') || !fs.existsSync(filePath)) {
      return new Response('Not found', { status: 404 })
    }

    // Let Electron/net serve the file as a standard Response.
    // This is the recommended modern pattern with protocol.handle.
    return net.fetch(pathToFileURL(filePath).toString())
  })
}

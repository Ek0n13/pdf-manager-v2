import { protocol } from 'electron'
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
  protocol.registerStreamProtocol('app-pdf', (request, callback) => {
    try {
      const url = new URL(request.url)

      // Example: app-pdf://local?path=/absolute/path/to/file.pdf
      const filePath = url.searchParams.get('path')
      if (!filePath) {
        callback({ statusCode: 400 })
        return
      }

      // Minimal sanity checks (optional; remove if you truly don’t care)
      if (!filePath.toLowerCase().endsWith('.pdf') || !fs.existsSync(filePath)) {
        callback({ statusCode: 404 })
        return
      }

      const stream = fs.createReadStream(filePath)

      callback({
        statusCode: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline'
        },
        data: stream
      })
    } catch {
      callback({ statusCode: 500 })
    }
  })
}

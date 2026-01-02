import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv'

export function loadRuntimeEnv(): void {
  // In dev, load the project .env (optional)
  if (!app.isPackaged) {
    dotenv.config()
    return
  }

  // In production, load a .env located in userData (per-machine config)
  const envPath = path.join(app.getPath('userData'), '.env')

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  } else {
    // Optional: create a template so users/admins know what to put there
    fs.writeFileSync(envPath, 'ORACLE_USER=\nORACLE_PW=\nORACLE_CONN_STR=\n', {
      encoding: 'utf-8'
    })
  }
}

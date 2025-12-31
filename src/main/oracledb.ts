import { getConnection, OUT_FORMAT_OBJECT } from 'oracledb'
import type { Connection, Result } from 'oracledb'
import { User } from '../shared/types'

async function oracleConnection(): Promise<Connection> {
  return await getConnection({
    user: import.meta.env['VITE_ORACLE_USER'],
    password: import.meta.env['VITE_ORACLE_PW'],
    connectionString: import.meta.env['VITE_ORACLE_CONN_STR']
  })
}

export async function getUsers(): Promise<User[]> {
  const conn = await oracleConnection()

  await conn.execute('ALTER SESSION SET RESULT_CACHE_MODE = MANUAL')

  const exec = await conn.execute('select t.* from table(api.get_users) t', [], {
    outFormat: OUT_FORMAT_OBJECT
  })
  conn.close()

  const result = exec as Result<User>
  return result.rows ?? []
}

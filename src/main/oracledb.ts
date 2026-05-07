import { BIND_IN, getConnection, NUMBER, OUT_FORMAT_OBJECT, STRING } from 'oracledb'
import type { Connection, Result } from 'oracledb'
import { User, UserLastPlayed, UsersApiResponseSchema } from '../shared/types'

// =======================
// ----- START OF: API -----
// =======================

function getApiHeaders(): HeadersInit {
  const apiKey = process.env['API_KEY']
  const clientId = process.env['CF_ACCESS_CLIENT_ID']
  const clientSecret = process.env['CF_ACCESS_CLIENT_SECRET']

  if (!apiKey) throw new Error('API_KEY is missing')
  if (!clientId) throw new Error('CF_ACCESS_CLIENT_ID is missing')
  if (!clientSecret) throw new Error('CF_ACCESS_CLIENT_SECRET is missing')

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'CF-Access-Client-Id': clientId,
    'CF-Access-Client-Secret': clientSecret
  }
}

export async function getUsersApi(): Promise<User[]> {
  const endpoint = 'https://pdf-manager-api.alexekon.cc/protected/users'

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getApiHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
  }

  const body: unknown = await response.json()
  const userApi = UsersApiResponseSchema.safeParse(body)
  if (!userApi.success) {
    throw new Error(userApi.error.message)
  }

  return userApi.data.response
}

// =======================
// ----- END OF: API -----
// =======================

async function oracleConnection(): Promise<Connection> {
  return await getConnection({
    // user: import.meta.env['VITE_ORACLE_USER'],
    // password: import.meta.env['VITE_ORACLE_PW'],
    // connectionString: import.meta.env['VITE_ORACLE_CONN_STR']
    user: process.env['ORACLE_USER'],
    password: process.env['ORACLE_PW'],
    connectionString: process.env['ORACLE_CONN_STR']
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

export async function getUserLastPlayed(userId: User['ID']): Promise<UserLastPlayed | null> {
  const conn = await oracleConnection()

  await conn.execute('ALTER SESSION SET RESULT_CACHE_MODE = MANUAL')

  const exec = await conn.execute(
    'select t.* from table(api.get_user_last_played(:p_user_id)) t',
    {
      p_user_id: {
        val: userId,
        dir: BIND_IN,
        type: NUMBER
      }
    },
    {
      outFormat: OUT_FORMAT_OBJECT
    }
  )
  conn.close()

  const result = exec as Result<UserLastPlayed>
  return result.rows ? result.rows[0] : null
}

export async function saveUserLastPlayed(
  userId: UserLastPlayed['ID'],
  lastPlayed: UserLastPlayed['LAST_PLAYED']
): Promise<void> {
  const cn = await oracleConnection()
  if (!cn) return

  await cn.execute('begin api.add_user_last_played(:p_user_id, :p_last_played); end;', {
    p_user_id: {
      val: userId,
      dir: BIND_IN,
      type: NUMBER
    },
    p_last_played: {
      val: lastPlayed,
      dir: BIND_IN,
      type: STRING,
      maxSize: 512
    }
  })
  cn.close()
}

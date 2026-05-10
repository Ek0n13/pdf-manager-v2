import { BIND_IN, getConnection, NUMBER, OUT_FORMAT_OBJECT, STRING } from 'oracledb'
import type { Connection, Result } from 'oracledb'
import {
  User,
  UserApiLastPlayedResponseSchema,
  UserLastPlayed,
  UsersApiResponseSchema
} from '../shared/types'

// =======================
// ----- START OF: API -----
// =======================

const baseUrl = 'https://pdf-manager-api.alexekon.cc/protected'

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
  const endpoint = `${baseUrl}/users`

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

export async function getUserLastPlayedApi(userId: User['ID']): Promise<UserLastPlayed | null> {
  const endpoint = `${baseUrl}/users/${userId}/last-played`

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getApiHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
  }

  const body: unknown = await response.json()
  const userLastPlayedApi = UserApiLastPlayedResponseSchema.safeParse(body)
  if (!userLastPlayedApi.success) {
    throw new Error(userLastPlayedApi.error.message)
  }

  return userLastPlayedApi.data.response[0]
}

export async function saveUserLastPlayedApi(
  userId: User['ID'],
  lastPlayed: UserLastPlayed['LAST_PLAYED']
): Promise<void> {
  const endpoint = `${baseUrl}/users/${userId}/last-played`

  const payload = JSON.stringify({
    lastPlayed: lastPlayed
  })
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...getApiHeaders(),
      'Content-Type': 'application/json'
    },
    body: payload
  })

  if (!response.ok) {
    throw new Error('User last played not saved')
  }
}

export async function addUserApi(userName: User['NAME']): Promise<void> {
  const endpoint = `${baseUrl}/users`

  const payload = JSON.stringify({
    userName: userName
  })
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...getApiHeaders(),
      'Content-Type': 'application/json'
    },
    body: payload
  })

  if (!response.ok) {
    throw new Error('User not added')
  }
}

export async function deleteUserApi(userId: User['ID']): Promise<void> {
  const endpoint = `${baseUrl}/users/${userId}`

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: getApiHeaders()
  })

  if (!response.ok) {
    throw new Error('User not deleted')
  }
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

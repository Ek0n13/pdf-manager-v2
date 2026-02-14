import { Effect, Schema } from 'effect'
import { APINetworkError, APIHTTPError, APIDecoderError } from './errors'

const userSchema = Schema.Struct({
  ID: Schema.Number,
  NAME: Schema.String
})
const usersSchema = Schema.Array(userSchema)
const responseUsersSchema = Schema.Struct({
  ok: Schema.Boolean,
  response: usersSchema
})
export type EffectUser = typeof userSchema.Type

// const transformUsersSchema = Schema.transform(responseUsersSchema, usersSchema, {
//   strict: true,
//   decode: (v) => v.response,
//   encode: (v) => ({ ok: true, response: v, cause: null })
// })
// export const decodeUsersTransformResponse = Schema.decodeUnknown(transformUsersSchema)

// class GetUsersHTTPError extends Schema.TaggedError<GetUsersHTTPError>()('GetUsersHTTPError', {
//   status: Schema.Number,
//   statusText: Schema.String,
//   body: Schema.String
// }) {}

// class GetUsersNetworkError extends Schema.TaggedError<GetUsersNetworkError>()(
//   'GetUsersNetworkError',
//   { cause: Schema.Defect }
// ) {}

// class GetUsersDecoderError extends Schema.TaggedError<GetUsersDecoderError>()(
//   'GetUsersDecoderError',
//   { cause: Schema.Defect }
// ) {}

const endpoint = '/protected/users'

const fetchUsers = Effect.gen(function* () {
  const response = yield* Effect.tryPromise({
    try: () =>
      fetch(`https://pdf-manager-api.alexekon.cc${endpoint}`, {
        method: 'GET',
        headers: {
          'CF-Access-Client-Id': `${process.env['CF_ACCESS_CLIENT_ID']}`,
          'CF-Access-Client-Secret': `${process.env['CF_ACCESS_CLIENT_SECRET']}`,
          Authorization: `Bearer ${process.env['API_KEY']}`,
          'Content-Type': 'application/json'
        }
      }),
    catch: (cause) => new APINetworkError({ endpoint: endpoint, cause: cause })
  })

  const text = yield* Effect.tryPromise({
    try: () => response.text(),
    catch: (cause) => new APINetworkError({ endpoint: endpoint, cause: cause })
  })

  if (!response.ok) {
    // return yield* new GetUsersHTTPError({
    //   status: response.status,
    //   statusText: response.statusText,
    //   body: text
    // })
    return yield* new APIHTTPError({
      endpoint: endpoint,
      status: response.status,
      statusText: response.statusText,
      body: text
    })
  }

  const json = yield* Effect.try({
    try: () => JSON.parse(text),
    catch: (cause) => new APIDecoderError({ endpoint: endpoint, cause: cause })
  })

  const decoded = yield* Schema.decodeUnknown(responseUsersSchema)(json).pipe(
    Effect.mapError((cause) => new APIDecoderError({ endpoint: endpoint, cause: cause }))
  )

  return decoded.response
})
  // .pipe(Effect.retry(Schedule.exponential('5 second')))
  .pipe(
    Effect.catchTags({
      APIHTTPError: (err) =>
        Effect.succeed({ ok: false, value: null, cause: `HTTPError: ${err.message}` as const }),
      APINetworkError: (err) =>
        Effect.succeed({ ok: false, value: null, cause: `NetworkError: ${err.message}` as const }),
      APIDecoderError: (err) =>
        Effect.succeed({ ok: false, value: null, cause: `DecoderError: ${err.message}` as const })
    }),
    Effect.map((v) => ({ ok: true as const, value: v, cause: null }))
  )

export async function runFetchUsers() {
  return await Effect.runPromise(fetchUsers)
}

// export async function runFetchUsers() {
//   const exit = await Effect.runPromiseExit(fetchUsers())
//   if (exit._tag === 'Success') {
//     return { ok: true, value: exit.value, cause: null }
//   }

//   if (exit._tag === 'Failure') {
//     const error = exit.cause

//     if (error._tag === 'Fail') {
//       const getUserError = error.error
//       switch (getUserError._tag) {
//         case 'GetUsersHTTPError':
//           return { ok: false, value: null, cause: 'HTTPError' }
//         case 'GetUsersDecoderError':
//           return { ok: false, value: null, cause: 'DecoderError' }
//         case 'GetUsersNetworkError':
//           return { ok: false, value: null, cause: 'NetworkError' }
//       }
//     }
//   }

//   return { ok: false, value: null, cause: null }
// }

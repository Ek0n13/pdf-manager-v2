import { z } from 'zod'

export type PathFullPath = {
  path: string
  fullPath: string
}

// User
export const UserSchema = z.object({
  ID: z.number(),
  NAME: z.string(),
  DELETED: z.coerce.date().optional(),
  CREATED: z.coerce.date().optional()
})

export type User = z.infer<typeof UserSchema>

export const UsersApiResponseSchema = z.object({
  ok: z.boolean(),
  response: z.array(UserSchema)
})

export type UsersApiResponse = z.infer<typeof UsersApiResponseSchema>

// User Last Played
export const UserLastPlayedSchema = z.object({
  LAST_PLAYED: z.string(),
  ID: z.number()
})

export type UserLastPlayed = z.infer<typeof UserLastPlayedSchema>

export const UserApiLastPlayedResponseSchema = z.object({
  ok: z.boolean(),
  response: z.array(UserLastPlayedSchema)
})

export type UserApiLastPlayedResponse = z.infer<typeof UserApiLastPlayedResponseSchema>

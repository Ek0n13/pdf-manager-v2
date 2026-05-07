import { z } from 'zod'

export type PathFullPath = {
  path: string
  fullPath: string
}

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

export type UserLastPlayed = {
  LAST_PLAYED: string
  ID: number
}

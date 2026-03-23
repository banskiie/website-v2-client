import { z } from "zod"

export const UploadVideoSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().optional(),
  players: z.array(z.string().nonempty("Player ID is required")).optional(),
})

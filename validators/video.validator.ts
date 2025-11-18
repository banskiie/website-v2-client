import { z } from "zod"

export const UploadVideoSchema = z.object({
  title: z.string().nonempty("Title is required"),
  players: z.array(z.string().nonempty("Player ID is required")).optional(),
})

import { z } from "zod"

export const JerseySchema = z.object({
  size: z.enum(["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL", "XXXXXL"]),
  player: z.string().min(1, "Player is required"),
  tournament: z.string().min(1, "Tournament is required"),
  statuses: z.array(z.object({
    status: z.enum(["PENDING", "PAID", "CLAIMED", "CANCELLED"]),
    dateUpdated: z.string().datetime()
  })).min(1, "At least one status is required")
})

export type JerseyInput = z.infer<typeof JerseySchema>
import { z } from "zod"
import { Gender } from "@/types/shared.interface"
import { JerseySize } from "@/types/jersey.interface"

export const NewPlayerEntrySchema = z.object({
  firstName: z
    .string()
    .nonempty("First name is required")
    .max(50, "First name must be at most 50 characters long"),
  middleName: z
    .string()
    .max(50, "Middle name must be at most 50 characters long")
    .optional()
    .nullable(),
  lastName: z
    .string()
    .nonempty("Last name is required")
    .max(50, "Last name must be at most 50 characters long"),
  suffix: z
    .string()
    .max(10, "Suffix be at most 10 characters long")
    .optional()
    .nullable(),
  gender: z.enum(Object.values(Gender)).nonoptional("Gender is required"),
  birthDate: z.coerce.date("Invalid birth date"),
  phoneNumber: z
    .string()
    .length(11, "Phone number must be exactly 11 digits long")
    .regex(
      /^09\d{9}$/,
      "Phone number must start with '09' and contain 11 digits"
    ),
  email: z.email("Invalid email address"),
  jerseySize: z.enum(Object.values(JerseySize)).optional().nullable(),
})

export const PlayerSchema = z.object({
  event: z.string().nonempty("Event ID is required"),
  club: z.string().optional(),
  player1Entry: NewPlayerEntrySchema,
  player2Entry: NewPlayerEntrySchema.optional().nullable(),
  connectedPlayer1: z.string().optional().nullable(),
  connectedPlayer2: z.string().optional().nullable(),
  isInSoftware: z.boolean().default(false),
  isEarlyBird: z.boolean().default(false),
})

import { z } from "zod"
import { PlayerLevel, ValidDocumentType } from "../types/player.interface"
import { Gender } from "@/types/shared.interface"

export const PlayerSchema = z.object({
  firstName: z
    .string()
    .nonempty("First name is required")
    .min(2, "First name must be at least 2 character long")
    .max(50, "First name must be at most 50 character long")
    .trim(),
  middleName: z.string().trim().optional(),
  lastName: z
    .string()
    .nonempty("Last name is required")
    .min(2, "Last name must be at least 2 character long")
    .max(50, "Last name must be at most 50 character long")
    .trim(),
  suffix: z.string().trim().optional(),
  gender: z
    .enum(Object.values(Gender))
    .nonoptional("Gender is required")
    .default(Gender.MALE),
  birthDate: z.coerce.date().nonoptional("birthDate is required"),
  email: z.email("Invalid email address").optional(),
  phoneNumber: z
    .string()
    .length(11, "Phone number must be exactly 11 digits long")
    .regex(
      /^09\d{9}$/,
      "Phone number must start with '09' and contain 11 digits"
    )
    .optional(),
  levels: z
    .array(
      z.object({
        level: z
          .enum(Object.values(PlayerLevel))
          .nonoptional("Level is required"),
        dateLevelled: z.coerce.date().nonoptional("Date levelled is required"),
      })
    )
    .default([]),
  validDocuments: z
    .array(
      z.object({
        documentURL: z.string().url("Invalid document URL"),
        documentType: z
          .enum(Object.values(ValidDocumentType))
          .nonoptional("Document type is required"),
        dateUploaded: z.coerce.date().nonoptional("Date uploaded is required"),
      })
    )
    .default([]),
  isArchived: z.boolean().default(false),
})

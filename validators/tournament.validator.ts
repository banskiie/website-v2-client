import { z } from "zod"

export const TournamentSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(2, "Name must be at least 2 character long")
    .max(50, "Name must be at most 50 character long")
    .trim(),
  settings: z.object({
    hasEarlyBird: z.boolean(),
    hasFreeJersey: z.boolean(),
    hasGuidelines: z.boolean().default(false),
    ticket: z
      .string()
      .min(2, "Name must be at least 2 character long")
      .max(5, "Name must be at most 5 character long")
      .trim(),
    maxEntriesPerPlayer: z
      .number()
      .min(0, "Max Entries Per Player must be at least 0")
      .max(100, "Max Entries Per Player must be at most 100"),
  }),
  dates: z.object({
    registrationStart: z.coerce.date("Registration Start must be a valid date"),
    registrationEnd: z.coerce.date("Registration End must be a valid date"),
    earlyBirdRegistrationEnd: z.coerce.date().optional(),
    earlyBirdPaymentEnd: z.coerce.date().optional(),
    registrationPaymentEnd: z.coerce.date(
      "Registration Payment End must be a valid date"
    ),
    tournamentStart: z.coerce.date("Tournament Start must be a valid date"),
    tournamentEnd: z.coerce.date("Tournament End must be a valid date"),
  }),
  banks: z
    .array(
      z.object({
        name: z
          .string()
          .nonempty("Bank name is required")
          .min(2, "Name must be at least 2 character long")
          .max(50, "Name must be at most 50 character long")
          .trim(),
        accountNumber: z
          .string()
          .nonempty("Name is required")
          .min(2, "Name must be at least 2 character long")
          .max(50, "Name must be at most 50 character long")
          .trim(),
        imageURL: z.string().trim().optional(),
      })
    )
    .min(1, "At least one bank is required"),
})

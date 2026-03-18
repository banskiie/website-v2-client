// import z from "zod"
// import { Gender } from "@/types/shared.interface"
// import { JerseySize } from "@/types/jersey.interface"

// const NewPlayerEntrySchema = z.object({
//   firstName: z
//     .string()
//     .nonempty("First name is required")
//     .max(50, "First name must be at most 50 characters long"),
//   middleName: z
//     .string()
//     .max(50, "Middle name must be at most 50 characters long")
//     .optional()
//     .nullable(),
//   lastName: z
//     .string()
//     .nonempty("Last name is required")
//     .max(50, "Last name must be at most 50 characters long"),
//   suffix: z
//     .string()
//     .max(10, "Suffix be at most 10 characters long")
//     .optional()
//     .nullable(),
//   gender: z.enum(Object.values(Gender)).nonoptional("Gender is required"),
//   birthDate: z.coerce.date("Invalid birth date"),
//   phoneNumber: z
//     .string()
//     .length(10, "Phone number must be exactly 10 digits long")
//     .regex(
//       /^9\d{9}$/,
//       "Phone number must start with '9' and contain 10 digits"
//     ),
//   email: z.email("Invalid email address"),
//   jerseySize: z.enum(Object.values(JerseySize)).optional().nullable(),
// })

// export const CreateEntrySchema = z.object({
//   event: z.string().nonempty("Event ID is required"),
//   club: z.string().optional(),
//   player1Entry: NewPlayerEntrySchema,
//   player2Entry: NewPlayerEntrySchema.optional().nullable(),
//   connectedPlayer1: z.string().optional().nullable(),
//   connectedPlayer2: z.string().optional().nullable(),
//   isPlayer1New: z.boolean().default(false),
//   isPlayer2New: z.boolean().default(false),
//   isInSoftware: z.boolean().default(false),
//   isEarlyBird: z.boolean().default(false),
// })

// export const AssignPlayersSchema = z.object({
//   entry: z.string().nonempty("Entry ID is required"),
//   isPlayer1New: z.boolean().default(false),
//   isPlayer2New: z.boolean().default(false),
//   connectedPlayer1: z.string().optional().nullable(),
//   connectedPlayer2: z.string().optional().nullable(),
//   migratePlayer1Data: z.object({
//     firstName: z.boolean().default(false),
//     middleName: z.boolean().default(false),
//     lastName: z.boolean().default(false),
//     suffix: z.boolean().default(false),
//     birthDate: z.boolean().default(false),
//     phoneNumber: z.boolean().default(false),
//     email: z.boolean().default(false),
//     validDocuments: z.boolean().default(false),
//   }),
//   migratePlayer2Data: z.object({
//     firstName: z.boolean().default(false),
//     middleName: z.boolean().default(false),
//     lastName: z.boolean().default(false),
//     suffix: z.boolean().default(false),
//     birthDate: z.boolean().default(false),
//     phoneNumber: z.boolean().default(false),
//     email: z.boolean().default(false),
//     validDocuments: z.boolean().default(false),
//   }),
// })


// const extractFieldValidators = () => {
//   const firstNameValidator = NewPlayerEntrySchema.shape.firstName
//   const lastNameValidator = NewPlayerEntrySchema.shape.lastName
//   const emailValidator = NewPlayerEntrySchema.shape.email
//   const phoneValidator = NewPlayerEntrySchema.shape.phoneNumber
//   const birthDateValidator = NewPlayerEntrySchema.shape.birthDate
//   const genderValidator = NewPlayerEntrySchema.shape.gender
//   const jerseySizeValidator = NewPlayerEntrySchema.shape.jerseySize

//   return {
//     firstName: firstNameValidator,
//     lastName: lastNameValidator,
//     email: emailValidator,
//     phoneNumber: phoneValidator,
//     birthDate: birthDateValidator,
//     gender: genderValidator,
//     jerseySize: jerseySizeValidator,
//   }
// }

// export const fieldValidators = extractFieldValidators()

import z from "zod"
import { Gender } from "@/types/shared.interface"
import { JerseySize } from "@/types/jersey.interface"
import { EventGender } from "@/types/event.interface"

const NewPlayerEntrySchema = z.object({
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
    .length(10, "Phone number must be exactly 10 digits long")
    .regex(
      /^9\d{9}$/,
      "Phone number must start with '9' and contain 10 digits"
    ),
  email: z.email("Invalid email address"),
  jerseySize: z.enum(Object.values(JerseySize) as [string, ...string[]]).optional().nullable(),
})

// Create a function to validate gender based on event type
export const validateEntryGenders = (
  eventGender: EventGender | null,
  isDoubles: boolean,
  player1Gender: Gender,
  player2Gender: Gender | null | undefined
): { valid: boolean; errors: { player1?: string; player2?: string } } => {
  const errors: { player1?: string; player2?: string } = {};

  if (!isDoubles || !eventGender) {
    return { valid: true, errors };
  }

  if (eventGender === EventGender.MALE) {
    if (player1Gender !== Gender.MALE) {
      errors.player1 = "Player 1 must be Male for Men's Doubles event";
    }
    if (player2Gender !== Gender.MALE) {
      errors.player2 = "Player 2 must be Male for Men's Doubles event";
    }
  } else if (eventGender === EventGender.FEMALE) {
    if (player1Gender !== Gender.FEMALE) {
      errors.player1 = "Player 1 must be Female for Women's Doubles event";
    }
    if (player2Gender !== Gender.FEMALE) {
      errors.player2 = "Player 2 must be Female for Women's Doubles event";
    }
  } else if (eventGender === EventGender.MIXED) {
    const isValid =
      (player1Gender === Gender.MALE && player2Gender === Gender.FEMALE) ||
      (player1Gender === Gender.FEMALE && player2Gender === Gender.MALE);

    if (!isValid) {
      errors.player2 = "Mixed Doubles requires one Male and one Female player";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const CreateEntrySchema = z.object({
  event: z.string().nonempty("Event ID is required"),
  club: z.string().optional(),
  player1Entry: NewPlayerEntrySchema,
  player2Entry: NewPlayerEntrySchema.optional().nullable(),
  connectedPlayer1: z.string().optional().nullable(),
  connectedPlayer2: z.string().optional().nullable(),
  isPlayer1New: z.boolean().default(false),
  isPlayer2New: z.boolean().default(false),
  isInSoftware: z.boolean().default(false),
  isEarlyBird: z.boolean().default(false),
})

export const AssignPlayersSchema = z.object({
  entry: z.string().nonempty("Entry ID is required"),
  isPlayer1New: z.boolean().default(false),
  isPlayer2New: z.boolean().default(false),
  connectedPlayer1: z.string().optional().nullable(),
  connectedPlayer2: z.string().optional().nullable(),
  migratePlayer1Data: z.object({
    firstName: z.boolean().default(false),
    middleName: z.boolean().default(false),
    lastName: z.boolean().default(false),
    suffix: z.boolean().default(false),
    birthDate: z.boolean().default(false),
    phoneNumber: z.boolean().default(false),
    email: z.boolean().default(false),
    validDocuments: z.boolean().default(false),
  }),
  migratePlayer2Data: z.object({
    firstName: z.boolean().default(false),
    middleName: z.boolean().default(false),
    lastName: z.boolean().default(false),
    suffix: z.boolean().default(false),
    birthDate: z.boolean().default(false),
    phoneNumber: z.boolean().default(false),
    email: z.boolean().default(false),
    validDocuments: z.boolean().default(false),
  }),
})

const extractFieldValidators = () => {
  const firstNameValidator = NewPlayerEntrySchema.shape.firstName
  const lastNameValidator = NewPlayerEntrySchema.shape.lastName
  const emailValidator = NewPlayerEntrySchema.shape.email
  const phoneValidator = NewPlayerEntrySchema.shape.phoneNumber
  const birthDateValidator = NewPlayerEntrySchema.shape.birthDate
  const genderValidator = NewPlayerEntrySchema.shape.gender
  const jerseySizeValidator = NewPlayerEntrySchema.shape.jerseySize

  return {
    firstName: firstNameValidator,
    lastName: lastNameValidator,
    email: emailValidator,
    phoneNumber: phoneValidator,
    birthDate: birthDateValidator,
    gender: genderValidator,
    jerseySize: jerseySizeValidator,
  }
}

export const fieldValidators = extractFieldValidators()
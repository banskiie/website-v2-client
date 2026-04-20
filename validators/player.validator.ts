import { z } from "zod"
import { Gender } from "../types/shared.interface"
import { PlayerLevel, ValidDocumentType } from "../types/player.interface"

// PSGC Location Schemas
const RegionSchema = z.object({
  code: z.string(),
  name: z.string(),
  regionName: z.string(),
  psgcCode: z.string(),
})

const ProvinceSchema = z.object({
  code: z.string(),
  name: z.string(),
  regionCode: z.string(),
  psgcCode: z.string(),
})

const CitySchema = z.object({
  code: z.string(),
  name: z.string(),
  provinceCode: z.string(),
  regionCode: z.string(),
  psgcCode: z.string(),
  classification: z.string(),
})

const BarangaySchema = z.object({
  code: z.string(),
  name: z.string(),
  cityCode: z.string(),
  provinceCode: z.string(),
  regionCode: z.string(),
  psgcCode: z.string(),
})

const CoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

const PlayerAddressSchema = z.object({
  region: RegionSchema.optional(),
  province: ProvinceSchema.optional(),
  city: CitySchema.optional(),
  barangay: BarangaySchema.optional(),
  street: z.string().optional(),
  zipCode: z.string().optional(),
  fullAddress: z.string(),
  coordinates: CoordinatesSchema.optional(),
})

export const PlayerSchema = z.object({
  firstName: z
    .string()
    .nonempty("First name is required")
    .max(50, "First name must be at most 50 character long")
    .trim()
    .or(z.literal("")),
  middleName: z.string().trim().optional().or(z.literal("")),
  lastName: z
    .string()
    .nonempty("Last name is required")
    .max(50, "Last name must be at most 50 character long")
    .trim()
    .or(z.literal("")),
  suffix: z.string().trim().optional().or(z.literal("")),
  gender: z.enum(Object.values(Gender)).optional(),
  birthDate: z.coerce
    .date()
    .optional()
    .refine(
      (date) => {
        if (!date) return true
        const today = new Date()
        return (
          date.getFullYear() !== today.getFullYear() ||
          date.getMonth() !== today.getMonth() ||
          date.getDate() !== today.getDate()
        )
      },
      { message: "Please select a valid birth date" }
    ),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .refine(
      (val) => val === "" || (/^09\d{9}$/.test(val) && val.length === 11),
      {
        message:
          "Phone number must be empty or start with '09' and be exactly 11 digits",
      }
    ),
  achievements: z.array(z.string()).optional().default([]),
  levels: z
    .array(
      z.object({
        level: z.enum(Object.values(PlayerLevel)).optional(),
        dateLevelled: z.coerce.date().optional(),
      })
    )
    .default([]),
  validDocuments: z
    .array(
      z.object({
        documentURL: z.string().url("Invalid document URL"),
        documentType: z.enum(Object.values(ValidDocumentType)).optional(),
        dateUploaded: z.coerce.date().optional(),
      })
    )
    .default([]),
  address: PlayerAddressSchema.optional(),
})
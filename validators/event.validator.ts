import { z } from "zod"
import {
  EventCurrency,
  EventGender,
  EventLocation,
  EventType,
} from "../types/event.interface"

export const EventSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(2, "Name must be at least 2 character long")
    .max(50, "Name must be at most 50 character long")
    .trim(),
  gender: z
    .enum(Object.values(EventGender), "Gender is required")
    .nonoptional("Gender is required")
    .default(EventGender.MALE),
  type: z
    .enum(Object.values(EventType), "Type is required")
    .nonoptional("Type is required")
    .default(EventType.SINGLES),
  pricePerPlayer: z
    .number()
    .min(0, "Price per player must be at least 0")
    .nonoptional("Price per player is required"),
  earlyBirdPricePerPlayer: z
    .number()
    .min(0, "Early bird price per player must be at least 0")
    .optional()
    .nullable(),
  currency: z
    .enum(Object.values(EventCurrency), "Currency is required")
    .nonoptional("Currency is required")
    .default(EventCurrency.PHP),
  location: z
    .enum(Object.values(EventLocation), "Location is required")
    .nonoptional("Location is required")
    .default(EventLocation.NATIONAL),
  maxAge: z.number().min(0, "Max age must be at least 0").optional().nullable(),
  minAge: z.number().min(0, "Min age must be at least 0").optional().nullable(),
  tournament: z.string().nonempty("Tournament ID is required"),
  isClosed: z.boolean().default(false),
  // maxEntries: z
  //   .number()
  //   .min(0, "Max entries must not be less than 0.")
  //   .nonoptional("Max entries is required"),
  maxEntries: z
  .number()
  .min(0, "Max entries must not be less than 0.")
  .nullable()
  .optional()
  .transform(val => val === 0 ? null : val),
})

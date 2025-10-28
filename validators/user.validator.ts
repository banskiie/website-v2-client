import { Role } from "@/types/user.interface"
import { z } from "zod"

export const UserSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.email("Invalid email address"),
  contactNumber: z.string().nonempty("Contact number is required"),
  username: z.string().nonempty("Username is required"),
  role: z.enum(Object.values(Role)).nonoptional("Role is required"),
})

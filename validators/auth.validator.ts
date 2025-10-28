import z from "zod"

export const LoginSchema = z.object({
  username: z.string().nonempty("Username is required.").trim(),
  password: z.string().nonempty("Password is required.").trim(),
  rememberMe: z.boolean(),
})

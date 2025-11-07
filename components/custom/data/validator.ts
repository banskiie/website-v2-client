import z from "zod";

// export const formSchema = z.object({
//     // groupClub: z.string().min(1, "Club is required"),
//     // groupEmail: z.string().email("Invalid Email Address"),
//     // groupContactNumber: z.string().regex(/^9\d{9}$/, "Must be 10 digits starting with 9"),

//     // useGroupInfoPlayer1: z.boolean(),
//     // useGroupInfoPlayer2: z.boolean(),

//     contactClubPlayer1: z.string().optional(),
//     // contactMunicipalityPlayer1: z.string().optional(),
//     // contactProvincePlayer1: z.string().optional(),
//     contactNumberPlayer1: z.string().regex(/^9\d{9}$/, "Must be 10 digits starting with 9"),
//     contactEmailPlayer1: z.string().email("Invalid email address"),

//     contactClubPlayer2: z.string().optional(),
//     contactMunicipalityPlayer2: z.string().optional(),
//     contactProvincePlayer2: z.string().optional(),
//     contactNumberPlayer2: z.string().regex(/^9\d{9}$/, "Must be 10 digits starting with 9"),
//     contactEmailPlayer2: z.string().email("Invalid email address"),

//     category: z.string(),

//     player1FirstName: z.string().min(1),
//     player1MiddleName: z.string().optional(),
//     player1LastName: z.string().min(1),
//     player1Suffix: z.string().optional(),
//     player1Gender: z.string(),
//     player1Birthday: z.string(),
//     player1IdUpload: z.any().nullable(),
//     // player1Email: z.string().email("Invalid email address"),
//     player1JerseySize: z.string().min(1),

//     player2FirstName: z.string().min(1),
//     player2MiddleName: z.string().optional(),
//     player2LastName: z.string().min(1),
//     player2Suffix: z.string().optional(),
//     player2Gender: z.string(),
//     player2Birthday: z.string(),
//     player2IdUpload: z.any().nullable(),
//     // player2Email: z.string().email("Invalid email address"),
//     player2JerseySize: z.string().min(1),
// })
// validator.ts

const baseFormSchema = {
    club: z.string().min(1, "Club name is required"),
    clubEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
    clubContactNumber: z.string().optional(),
    contactNumberPlayer1: z.string().min(1, "Contact number is required"),
    contactEmailPlayer1: z.string().email("Invalid email address"),

    category: z.string(),

    player1FirstName: z.string().min(1, "First name is required"),
    player1MiddleName: z.string().optional(),
    player1LastName: z.string().min(1, "Last name is required"),
    player1Suffix: z.string().optional(),
    player1Gender: z.string().min(1, "Gender is required"),
    player1Birthday: z.string().min(1, "Birthday is required"),
    player1IdUpload: z.any().nullable(),
};

const player2Fields = {
    contactNumberPlayer2: z.string().min(1, "Contact number is required"),
    contactEmailPlayer2: z.string().email("Invalid email address"),

    player2FirstName: z.string().min(1, "First name is required"),
    player2MiddleName: z.string().optional(),
    player2LastName: z.string().min(1, "Last name is required"),
    player2Suffix: z.string().optional(),
    player2Gender: z.string().min(1, "Gender is required"),
    player2Birthday: z.string().min(1, "Birthday is required"),
    player2IdUpload: z.any().nullable(),
}

export const createFormSchema = (eventType: string, hasFreeJersey: boolean = false) => {
    const jerseySizeValidation = hasFreeJersey
        ? z.string().min(1, "Jersey size is required")
        : z.string().optional().or(z.literal(''));

    const baseWithJersey = {
        ...baseFormSchema,
        player1JerseySize: jerseySizeValidation,
    };

    if (eventType === "DOUBLES") {
        return z.object({
            ...baseWithJersey,
            ...player2Fields,
            player2JerseySize: jerseySizeValidation,
        });
    }

    return z.object({
        ...baseWithJersey,
        contactNumberPlayer2: z.string().optional(),
        contactEmailPlayer2: z.string().email("Invalid email address").optional().or(z.literal('')),

        player2FirstName: z.string().optional().or(z.literal('')),
        player2MiddleName: z.string().optional(),
        player2LastName: z.string().optional().or(z.literal('')),
        player2Suffix: z.string().optional(),
        player2Gender: z.string().optional().or(z.literal('')),
        player2Birthday: z.string().optional().or(z.literal('')),
        player2IdUpload: z.any().nullable(),
        player2JerseySize: z.string().optional().or(z.literal('')),
    });
};

export type FormData = z.infer<ReturnType<typeof createFormSchema>>;

// Keep your existing upload schema
export const uploadProofOfPaymentSchema = z.object({
    entries: z.array(
        z.object({
            entryNumber: z.string().min(1, "Entry number is required"),
            entryKey: z.string().min(1, "Entry key is required"),
        })
    ),
    amount: z
        .string()
        .min(1, "Amount is required")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: "Amount must be a valid positive number",
        }),
    preview: z.string().nullable().refine((val) => !!val, {
        message: "Proof of payment is required",
    }),
    totalRequired: z.number().min(1, "Total required must be greater than 0"),
}).superRefine((data, ctx) => {
    const amountNum = Number(data.amount);
    if (amountNum < data.totalRequired) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amount"],
            message: `Amount is not enough. Missing ₱${(
                data.totalRequired - amountNum
            ).toFixed(2)} from ₱${data.totalRequired}.`,
        });
    }
});

export type UploadProofFormData = z.infer<typeof uploadProofOfPaymentSchema>

export const emailValidator = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .email("Please enter a valid email address.")

export type EmailValidatorType = z.infer<typeof emailValidator>
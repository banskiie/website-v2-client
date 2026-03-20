import * as z from "zod";

export const GenderEnum = z
    .union([z.literal("MALE"), z.literal("FEMALE")])
    .refine((val) => val === "MALE" || val === "FEMALE", {
        message: "Gender is required",
    });

export const JerseySizeEnum = z
    .union([
        z.literal("XS"),
        z.literal("S"),
        z.literal("M"),
        z.literal("L"),
        z.literal("XL"),
        z.literal("XXL"),
    ])
    .refine((val) => !!val, { message: "Jersey Size is required" });

const calculateAge = (birthDate: Date, referenceDate: Date): number => {
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

const getBaseFields = (hasFreeJersey: boolean) => {
    const baseFields = {
        club: z.string().min(1, "Club name is required"),
        clubEmail: z.string().optional(),
        clubContactNumber: z.string().optional(),
        player1FirstName: z.string().min(1, "First name is required"),
        player1LastName: z.string().min(1, "Last name is required"),
        player1MiddleName: z.string().optional(),
        player1Suffix: z.string().optional(),
        player1Birthday: z.string().min(1, "Birthday is required"),
        player1Email: z.string().email("Invalid email address").optional(),
        player1ContactNumber: z.string()
            .min(1, "Contact number is required")
            .regex(/^9\d{9}$/, "Contact number must be 10 digits starting with 9"),
        player1Gender: GenderEnum,
    };

    if (hasFreeJersey) {
        return {
            ...baseFields,
            player1JerseySize: JerseySizeEnum,
        };
    }

    return baseFields;
};

const getDoublesFields = (hasFreeJersey: boolean) => {
    const doublesFields = {
        player2FirstName: z.string().min(1, "First name is required"),
        player2LastName: z.string().min(1, "Last name is required"),
        player2MiddleName: z.string().optional(),
        player2Suffix: z.string().optional(),
        player2Birthday: z.string().min(1, "Birthday is required"),
        player2Email: z.string().email("Invalid email address").optional(),
        player2ContactNumber: z.string()
            .min(1, "Contact number is required")
            .regex(/^9\d{9}$/, "Contact number must be 10 digits starting with 9"),
        player2Gender: GenderEnum,
    };

    if (hasFreeJersey) {
        return {
            ...doublesFields,
            player2JerseySize: JerseySizeEnum,
        };
    }

    return doublesFields;
};

// Create singles fields without validation
const getSinglesFields = (hasFreeJersey: boolean) => {
    const singlesFields = {
        player2FirstName: z.string().optional(),
        player2LastName: z.string().optional(),
        player2MiddleName: z.string().optional(),
        player2Suffix: z.string().optional(),
        player2Birthday: z.string().optional(),
        player2Email: z.string().email("Invalid email address").optional().or(z.literal("")),
        player2ContactNumber: z.string().optional(),
        player2Gender: z.string().optional(),
    };

    if (hasFreeJersey) {
        return {
            ...singlesFields,
            player2JerseySize: z.string().optional(),
        };
    }

    return singlesFields;
};

const createBaseSchema = (hasFreeJersey: boolean, eventData?: any) => {
    const baseFields = getBaseFields(hasFreeJersey);
    const schema = z.object(baseFields);

    return schema.superRefine((data, ctx) => {
        if (eventData?.tournamentStart && data.player1Birthday) {
            const birthDate = new Date(data.player1Birthday);
            const tournamentDate = new Date(eventData.tournamentStart);
            const age = calculateAge(birthDate, tournamentDate);

            if (eventData?.minAge !== undefined && eventData?.minAge !== 0 && age < eventData.minAge) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Age ${age} is below minimum age of ${eventData.minAge}`,
                    path: ["player1Birthday"],
                });
            }
            if (eventData?.maxAge !== undefined && eventData?.maxAge !== 0 && age > eventData.maxAge) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Age ${age} is above maximum age of ${eventData.maxAge}`,
                    path: ["player1Birthday"],
                });
            }
        }
    });
};

const createDoublesSchema = (hasFreeJersey: boolean, eventData?: any) => {
    const baseFields = getBaseFields(hasFreeJersey);
    const doublesFields = getDoublesFields(hasFreeJersey);

    const allFields = {
        ...baseFields,
        ...doublesFields,
    };

    const schema = z.object(allFields);

    return schema.superRefine((data, ctx) => {
        if (eventData?.tournamentStart && data.player1Birthday) {
            const birthDate = new Date(data.player1Birthday);
            const tournamentDate = new Date(eventData.tournamentStart);
            const age = calculateAge(birthDate, tournamentDate);

            if (eventData?.minAge !== undefined && eventData?.minAge !== 0 && age < eventData.minAge) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Player 1: Age ${age} is below minimum age of ${eventData.minAge}`,
                    path: ["player1Birthday"],
                });
            }
            if (eventData?.maxAge !== undefined && eventData?.maxAge !== 0 && age > eventData.maxAge) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Player 1: Age ${age} is above maximum age of ${eventData.maxAge}`,
                    path: ["player1Birthday"],
                });
            }
        }

        if (eventData?.tournamentStart && data.player2Birthday) {
            const birthDate = new Date(data.player2Birthday);
            const tournamentDate = new Date(eventData.tournamentStart);
            const age = calculateAge(birthDate, tournamentDate);

            if (eventData?.minAge !== undefined && eventData?.minAge !== 0 && age < eventData.minAge) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Player 2: Age ${age} is below minimum age of ${eventData.minAge}`,
                    path: ["player2Birthday"],
                });
            }
            if (eventData?.maxAge !== undefined && eventData?.maxAge !== 0 && age > eventData.maxAge) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Player 2: Age ${age} is above maximum age of ${eventData.maxAge}`,
                    path: ["player2Birthday"],
                });
            }
        }

        if (eventData?.gender === "MIXED") {
            if (data.player1Gender && data.player2Gender && data.player1Gender === data.player2Gender) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `For MIXED doubles events, players must have different genders. Both players are ${data.player1Gender === "MALE" ? "male" : "female"}.`,
                    path: ["player2Gender"],
                });
            }
        }
    });
};

const createSinglesSchema = (hasFreeJersey: boolean, eventData?: any) => {
    const baseFields = getBaseFields(hasFreeJersey);
    const singlesFields = getSinglesFields(hasFreeJersey);

    const allFields = {
        ...baseFields,
        ...singlesFields,
    };

    const schema = z.object(allFields);

    return schema.superRefine((data, ctx) => {
        if (eventData?.tournamentStart && data.player1Birthday) {
            const birthDate = new Date(data.player1Birthday);
            const tournamentDate = new Date(eventData.tournamentStart);
            const age = calculateAge(birthDate, tournamentDate);

            if (eventData?.minAge !== undefined && eventData?.minAge !== 0 && age < eventData.minAge) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Age ${age} is below minimum age of ${eventData.minAge}`,
                    path: ["player1Birthday"],
                });
            }
            if (eventData?.maxAge !== undefined && eventData?.maxAge !== 0 && age > eventData.maxAge) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Age ${age} is above maximum age of ${eventData.maxAge}`,
                    path: ["player1Birthday"],
                });
            }
        }
    });
};

export const createFormSchema = (eventType: string, hasFreeJersey: boolean = false, eventData?: any) => {
    return eventType === "DOUBLES"
        ? createDoublesSchema(hasFreeJersey, eventData)
        : createSinglesSchema(hasFreeJersey, eventData);
};

export const formSchema = createDoublesSchema(true);
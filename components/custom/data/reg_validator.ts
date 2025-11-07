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

const createBaseSchema = (hasFreeJersey: boolean) => {
    const baseFields = {
        club: z.string().min(1, "Club name is required"),
        clubEmail: z.string().optional(),
        clubContactNumber: z.string().optional(),
        player1FirstName: z.string().min(1, "First name is required"),
        player1LastName: z.string().min(1, "Last name is required"),
        player1MiddleName: z.string().min(1, "Middle name is required"),
        player1Suffix: z.string().optional(),
        player1Birthday: z.string().min(1, "Birthday is required"),
        player1Email: z.string().email("Invalid email address").optional(),
        player1ContactNumber: z.string().optional(),
        player1Gender: GenderEnum,
    };

    if (hasFreeJersey) {
        return z.object({
            ...baseFields,
            player1JerseySize: JerseySizeEnum,
        });
    }

    return z.object(baseFields);
};

const createDoublesSchema = (hasFreeJersey: boolean) => {
    const baseSchema = createBaseSchema(hasFreeJersey);
    
    const doublesFields = {
        player2FirstName: z.string().min(1, "First name is required"),
        player2LastName: z.string().min(1, "Last name is required"),
        player2MiddleName: z.string().min(1, "Middle name is required"),
        player2Suffix: z.string().optional(),
        player2Birthday: z.string().min(1, "Birthday is required"),
        player2Email: z.string().email("Invalid email address").optional(),
        player2ContactNumber: z.string().optional(),
        player2Gender: GenderEnum,
    };

    if (hasFreeJersey) {
        return baseSchema.extend({
            ...doublesFields,
            player2JerseySize: JerseySizeEnum,
        });
    }

    return baseSchema.extend(doublesFields);
};

const createSinglesSchema = (hasFreeJersey: boolean) => {
    const baseSchema = createBaseSchema(hasFreeJersey);
    
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
        return baseSchema.extend({
            ...singlesFields,
            player2JerseySize: z.string().optional(),
        });
    }

    return baseSchema.extend(singlesFields);
};

export const createFormSchema = (eventType: string, hasFreeJersey: boolean = false) => {
    return eventType === "DOUBLES" 
        ? createDoublesSchema(hasFreeJersey) 
        : createSinglesSchema(hasFreeJersey);
};

export const formSchema = createDoublesSchema(true);
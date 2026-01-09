import z from "zod"

export const PaymentMethodEnum = z.enum([
    "GCASH",
    "BANK_TRANSFER",
    "OVER_THE_COUNTER",
])

export const PaymentSchema = z.object({
    payerName: z.string().min(1, "Payer name is required"),
    referenceNumber: z.string().min(1, "Reference number is required"),
    amount: z.number().min(1, "Amount must be greater than 0"),
    method: PaymentMethodEnum,
    paymentDate: z.coerce.date("Invalid payment date"),
    entryList: z.array(z.string()).optional(),
})
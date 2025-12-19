export interface CreatePaymentInput {
    referenceNumber: string
    amount: number
    paymentDate: string
    proofOfPaymentURL: string
    method: string
    payerName: string
    entryList: Array<{
        entry: string
        isFullyPaid: boolean
    }>
}

export interface createPaymentResponse {
    createPayment: {
        ok: boolean
        message: string
    }
}
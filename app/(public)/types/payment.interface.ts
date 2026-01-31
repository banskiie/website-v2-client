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

export interface DuplicateCheckResponse {
    checkDuplicateReference: Array<{
        _id: string
        payerName: string
        referenceNumber: string
        amount: number
        method: string
        paymentDate: string
        proofOfPaymentURL: string
        statuses: Array<{
            status: string
            date: string
            reason?: string
            by: {
                _id: string
                name: string
                email: string
                contactNumber: string
                username: string
                role: string
                isActive: boolean
                createdAt: string
                updatedAt: string
            }
        }>
        entryList: Array<{
            isFullyPaid: boolean
            entry: {
                _id: string
                entryNumber: string
                entryKey: string
            }
        }>
        remarks: Array<{
            remark: string
            date: string
            by: {
                _id: string
                name: string
                email: string
                contactNumber: string
                username: string
                role: string
                isActive: boolean
                createdAt: string
                updatedAt: string
            }
        }>
    }>
}
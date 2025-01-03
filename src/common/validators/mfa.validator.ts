import {z} from "zod"

export const verifyMFASchema = z.object({
    code: z.string().trim().min(1).max(6),
    secretKey: z.string().trim().min(1)
})

export const verifyMFAForLoginSchema = z.object({
    code: z.string().trim().min(1).max(6),
    email: z.string().trim().email().min(3),
    userAgent: z.string().optional()
})
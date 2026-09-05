import z from "zod";

export const MAX_RESUME_BYTES = 3.5 * 1024 * 1024;

export const PreInterviewBody = z
    .object({
        resume: z
            .object({
                content: z.string().min(1),
                filename: z.string().min(1),
            })
            .optional(),
        summary: z.string().min(1).optional(),
    })
    .refine((data) => !!data.resume !== !!data.summary, {
        message: "Provide either a resume or a summary, not both.",
    });

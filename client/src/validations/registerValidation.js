import { z } from "zod";

export const registerDefaultValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

export const registerSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "validation.fullNameRequired")
            .min(3, "validation.fullNameMin"),
        email: z
            .string()
            .trim()
            .min(1, "validation.emailRequired")
            .email("validation.emailInvalid"),
        password: z
            .string()
            .min(1, "validation.passwordRequired")
            .refine(
                (value) => value.trim().length > 0,
                "validation.passwordRequired",
            )
            .min(6, "validation.passwordMin"),
        confirmPassword: z
            .string()
            .min(1, "validation.confirmPasswordRequired")
            .refine(
                (value) => value.trim().length > 0,
                "validation.confirmPasswordRequired",
            ),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "validation.passwordsMismatch",
        path: ["confirmPassword"],
    });

import { z } from "zod";

export const DESCRIPTION_MAX_LENGTH = 180;
export const TITLE_MIN_LENGTH = 5;
export const CATEGORY_MIN_LENGTH = 3;
export const DESCRIPTION_MIN_LENGTH = 15;
export const CONTENT_MIN_LENGTH = 30;

const HTTP_IMAGE_URL_REGEX = /^https?:\/\/.+$/i;

export const createPostDefaultValues = () => ({
    title: "",
    category: "",
    imageUrl: "",
    description: "",
    content: "",
});

export const createPostSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "validation.titleRequired")
        .min(TITLE_MIN_LENGTH, "validation.titleMin"),
    category: z
        .string()
        .trim()
        .min(1, "validation.categoryRequired")
        .min(CATEGORY_MIN_LENGTH, "validation.categoryMin"),
    imageUrl: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || HTTP_IMAGE_URL_REGEX.test(value),
            "validation.imageHttp",
        ),
    description: z
        .string()
        .trim()
        .min(1, "validation.descriptionRequired")
        .min(DESCRIPTION_MIN_LENGTH, "validation.descriptionMin")
        .max(DESCRIPTION_MAX_LENGTH, "validation.descriptionMax"),
    content: z
        .string()
        .trim()
        .min(1, "validation.contentRequired")
        .min(CONTENT_MIN_LENGTH, "validation.contentMin"),
});

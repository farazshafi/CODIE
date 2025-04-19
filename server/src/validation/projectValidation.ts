import {z} from "zod"

export const LanguagesEnum = z.enum([
    "javascript",
    "typescript",
    "java",
    "go",
    "cpp",
    "csharp",
    "ruby",
    "swift",
    "python",
    "rust"
]);

export const createProjectSchema = z.object({
    projectName: z.string().min(3).max(50),
    projectLanguage: LanguagesEnum,
    projectCode: z.string()
});
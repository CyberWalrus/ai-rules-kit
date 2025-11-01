import { z } from 'zod';

/** Схема валидации параметров для команды init */
export const initCommandParamsSchema = z.object({
    packageDir: z.string().min(1, 'packageDir cannot be empty'),
    targetDir: z.string().min(1, 'targetDir cannot be empty'),
});

/** Тип параметров команды init */
export type InitCommandParams = z.infer<typeof initCommandParamsSchema>;

/** Схема валидации параметров для команды replace-all */
export const replaceAllCommandParamsSchema = z.object({
    packageDir: z.string().min(1, 'packageDir cannot be empty'),
    targetDir: z.string().min(1, 'targetDir cannot be empty'),
});

/** Тип параметров команды replace-all */
export type ReplaceAllCommandParams = z.infer<typeof replaceAllCommandParamsSchema>;

/** Схема валидации параметров для команды update */
export const updateCommandParamsSchema = z.object({
    packageDir: z.string().min(1, 'packageDir cannot be empty'),
    targetDir: z.string().min(1, 'targetDir cannot be empty'),
});

/** Тип параметров команды update */
export type UpdateCommandParams = z.infer<typeof updateCommandParamsSchema>;

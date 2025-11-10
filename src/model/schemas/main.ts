import { z } from 'zod';

/** Схема валидации набора правил */
export const ruleSetSchema = z.object({
    fixedVersion: z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (x.y.z)')
        .optional(),
    id: z.string().min(1, 'Rule set id cannot be empty'),
    update: z.boolean(),
});

/** Схема валидации переопределения параметров файла */
export const fileOverrideSchema = z.object({
    file: z.string().min(1, 'File path cannot be empty'),
    yamlOverrides: z.record(z.string(), z.unknown()),
});

/** Схема валидации конфигурации правил */
export const rulesConfigSchema = z.object({
    $schema: z.string().url().optional(),
    cliVersion: z.string().regex(/^\d+\.\d+\.\d+$/, 'CLI version must be in semver format (x.y.z)'),
    configVersion: z.string().regex(/^\d+\.\d+\.\d+$/, 'Config version must be in semver format (x.y.z)'),
    fileOverrides: z.array(fileOverrideSchema).optional(),
    ignoreList: z.array(z.string()).optional(),
    installedAt: z.string().datetime({ message: 'installedAt must be a valid ISO 8601 datetime' }),
    promptsVersion: z
        .string()
        .regex(/^\d{4}\.\d{1,2}\.\d{1,2}\.\d+$/, 'Prompts version must be in CalVer format (YYYY.M.D.N)'),
    ruleSets: z.array(ruleSetSchema).min(1, 'At least one rule set is required'),
    settings: z.object({
        language: z.enum(['ru', 'en'], { message: 'Language must be "ru" or "en"' }),
    }),
    source: z.string().min(1, 'Source cannot be empty'),
    updatedAt: z.string().datetime({ message: 'updatedAt must be a valid ISO 8601 datetime' }),
    version: z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (x.y.z)')
        .optional(),
});

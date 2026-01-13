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
    ideType: z.enum(['cursor', 'trae'], { message: 'IDE type must be "cursor" or "trae"' }),
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
    systemRulesVersion: z
        .string()
        .regex(/^\d{4}\.\d{1,2}\.\d{1,2}\.\d+$/, 'System rules version must be in CalVer format (YYYY.M.D.N)')
        .optional(),
    updatedAt: z.string().datetime({ message: 'updatedAt must be a valid ISO 8601 datetime' }),
    version: z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (x.y.z)')
        .optional(),
});

/** Схема валидации метаинформации пользователя */
export const userMetaInfoSchema = z
    .object({
        age: z.number().int().positive().optional(),
        communicationStyle: z.string().optional(),
        device: z.string().optional(),
        language: z.string().optional(),
        location: z.string().optional(),
        name: z.string().optional(),
        os: z.string().optional(),
        role: z.string().optional(),
        stack: z.string().optional(),
        toolVersions: z.string().optional(),
    })
    .passthrough();

/** Схема валидации настроек MCP серверов */
export const mcpSettingsSchema = z.object({
    aiModel: z.string().min(1, 'AI model cannot be empty'),
    apiKey: z.string().min(1, 'API key cannot be empty'),
    apiProviders: z.string().optional(),
});

/** Схема валидации глобальной конфигурации пользователя */
export const userConfigSchema = z
    .object({
        githubToken: z.string().min(1, 'GitHub token cannot be empty').optional(),
        ideType: z.enum(['cursor', 'trae']).optional(),
        language: z.enum(['en', 'ru'], { message: 'Language must be "en" or "ru"' }),
        mcpSettings: mcpSettingsSchema.optional(),
        metaInfo: userMetaInfoSchema.optional(),
    })
    .passthrough();

/** Схема валидации конфигурации MCP сервера */
export const mcpServerConfigSchema = z.object({
    args: z.array(z.string()).optional(),
    command: z.string().min(1, 'Command cannot be empty'),
    env: z.record(z.string(), z.string()).optional(),
});

/** Схема валидации конфигурации MCP серверов */
export const mcpConfigSchema = z.object({
    mcpServers: z.record(z.string(), mcpServerConfigSchema),
});

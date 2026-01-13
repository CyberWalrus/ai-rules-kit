import { describe, expect, it } from 'vitest';

import { initCommandParamsSchema, replaceAllCommandParamsSchema, upgradeCommandParamsSchema } from '../command-params';
import { fileOverrideSchema, mcpSettingsSchema, rulesConfigSchema, ruleSetSchema, userConfigSchema } from '../main';

describe('ruleSetSchema', () => {
    it('должен успешно валидировать корректные данные набора правил', () => {
        const validData = {
            id: 'base',
            update: true,
        };

        const result = ruleSetSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validData);
        }
    });

    it('должен успешно валидировать набор правил с fixedVersion', () => {
        const validData = {
            fixedVersion: '1.0.0',
            id: 'base',
            update: true,
        };

        const result = ruleSetSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен отклонять пустой id', () => {
        const invalidData = {
            id: '',
            update: true,
        };

        const result = ruleSetSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять невалидный формат fixedVersion', () => {
        const invalidData = {
            fixedVersion: '1.0',
            id: 'base',
            update: true,
        };

        const result = ruleSetSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

describe('fileOverrideSchema', () => {
    it('должен успешно валидировать корректные данные переопределения', () => {
        const validData = {
            file: 'rules/file.mdc',
            yamlOverrides: {
                alwaysApply: true,
            },
        };

        const result = fileOverrideSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен отклонять пустой file', () => {
        const invalidData = {
            file: '',
            yamlOverrides: {},
        };

        const result = fileOverrideSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

describe('rulesConfigSchema', () => {
    it('должен успешно валидировать корректные данные конфигурации', () => {
        const validData = {
            cliVersion: '1.0.0',
            configVersion: '1.0.0',
            ideType: 'cursor',
            installedAt: '2025-11-01T12:00:00.000Z',
            promptsVersion: '2025.11.10.1',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
        };

        const result = rulesConfigSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен отклонять невалидный формат configVersion', () => {
        const invalidData = {
            configVersion: '1.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        const result = rulesConfigSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять невалидный язык', () => {
        const invalidData = {
            configVersion: '1.0.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'de',
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        const result = rulesConfigSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять пустой массив ruleSets', () => {
        const invalidData = {
            configVersion: '1.0.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [],
            settings: {
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        const result = rulesConfigSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

describe('initCommandParamsSchema', () => {
    it('должен успешно валидировать корректные параметры', () => {
        const validData = {
            packageDir: '/path/to/package',
            targetDir: '/path/to/target',
        };

        const result = initCommandParamsSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен отклонять пустой packageDir', () => {
        const invalidData = {
            packageDir: '',
            targetDir: '/path/to/target',
        };

        const result = initCommandParamsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять пустой targetDir', () => {
        const invalidData = {
            packageDir: '/path/to/package',
            targetDir: '',
        };

        const result = initCommandParamsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

describe('replaceAllCommandParamsSchema', () => {
    it('должен успешно валидировать корректные параметры', () => {
        const validData = {
            packageDir: '/path/to/package',
            targetDir: '/path/to/target',
        };

        const result = replaceAllCommandParamsSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен отклонять пустой packageDir', () => {
        const invalidData = {
            packageDir: '',
            targetDir: '/path/to/target',
        };

        const result = replaceAllCommandParamsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

describe('upgradeCommandParamsSchema', () => {
    it('должен успешно валидировать корректные параметры', () => {
        const validData = {
            packageDir: '/path/to/package',
            targetDir: '/path/to/target',
        };

        const result = upgradeCommandParamsSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен отклонять отсутствующие параметры', () => {
        const invalidData = {
            packageDir: '/path/to/package',
        };

        const result = upgradeCommandParamsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

describe('mcpSettingsSchema', () => {
    it('должен успешно валидировать корректные данные настроек MCP', () => {
        const validData = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'sk-or-v1-test-key',
        };

        const result = mcpSettingsSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validData);
        }
    });

    it('должен успешно валидировать настройки MCP с apiProviders', () => {
        const validData = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'sk-or-v1-test-key',
            apiProviders: 'Cerebras',
        };

        const result = mcpSettingsSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validData);
        }
    });

    it('должен отклонять пустой apiKey', () => {
        const invalidData = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: '',
        };

        const result = mcpSettingsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять отсутствующий apiKey', () => {
        const invalidData = {
            aiModel: 'openai/gpt-oss-120b',
        };

        const result = mcpSettingsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять пустой aiModel', () => {
        const invalidData = {
            aiModel: '',
            apiKey: 'sk-or-v1-test-key',
        };

        const result = mcpSettingsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять отсутствующий aiModel', () => {
        const invalidData = {
            apiKey: 'sk-or-v1-test-key',
        };

        const result = mcpSettingsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

describe('userConfigSchema', () => {
    it('должен успешно валидировать конфигурацию с mcpSettings', () => {
        const validData = {
            language: 'ru' as const,
            mcpSettings: {
                aiModel: 'openai/gpt-oss-120b',
                apiKey: 'sk-or-v1-test-key',
                apiProviders: 'Cerebras',
            },
        };

        const result = userConfigSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен успешно валидировать конфигурацию без mcpSettings', () => {
        const validData = {
            language: 'en' as const,
        };

        const result = userConfigSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен отклонять невалидные mcpSettings', () => {
        const invalidData = {
            language: 'ru' as const,
            mcpSettings: {
                aiModel: 'openai/gpt-oss-120b',
                apiKey: '',
            },
        };

        const result = userConfigSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

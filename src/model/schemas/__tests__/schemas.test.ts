import { describe, expect, it } from 'vitest';

import { initCommandParamsSchema, replaceAllCommandParamsSchema, updateCommandParamsSchema } from '../command-params';
import { versionSchema } from '../main';

describe('versionSchema', () => {
    it('должен успешно валидировать корректные данные версии', () => {
        const validData = {
            installedAt: '2025-11-01T12:00:00.000Z',
            source: 'cursor-rules',
            version: '1.0.0',
        };

        const result = versionSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validData);
        }
    });

    it('должен отклонять невалидный формат версии', () => {
        const invalidData = {
            installedAt: '2025-11-01T12:00:00.000Z',
            source: 'cursor-rules',
            version: '1.0',
        };

        const result = versionSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять невалидный формат даты', () => {
        const invalidData = {
            installedAt: 'invalid-date',
            source: 'cursor-rules',
            version: '1.0.0',
        };

        const result = versionSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять пустой source', () => {
        const invalidData = {
            installedAt: '2025-11-01T12:00:00.000Z',
            source: '',
            version: '1.0.0',
        };

        const result = versionSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });

    it('должен отклонять отсутствующие поля', () => {
        const invalidData = {
            version: '1.0.0',
        };

        const result = versionSchema.safeParse(invalidData);

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

describe('updateCommandParamsSchema', () => {
    it('должен успешно валидировать корректные параметры', () => {
        const validData = {
            packageDir: '/path/to/package',
            targetDir: '/path/to/target',
        };

        const result = updateCommandParamsSchema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('должен отклонять отсутствующие параметры', () => {
        const invalidData = {
            packageDir: '/path/to/package',
        };

        const result = updateCommandParamsSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});

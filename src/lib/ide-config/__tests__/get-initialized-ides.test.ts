import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { RulesConfig } from '../../../model';
import { VERSION_FILE_NAME } from '../../../model';
import { getInitializedIdes, getUninitializedIdes } from '../get-initialized-ides';

/** Создаёт временный конфиг для IDE */
async function createIdeConfig(targetDir: string, ideType: string): Promise<void> {
    const ideDir = ideType === 'claude-code' ? '.claude' : `.${ideType}`;
    const configDir = join(targetDir, ideDir);
    const configPath = join(configDir, VERSION_FILE_NAME);

    await mkdir(configDir, { recursive: true });

    const config: RulesConfig = {
        cliVersion: '1.0.0',
        configVersion: '1.0.0',
        ideType: ideType as 'claude-code' | 'cursor' | 'trae',
        installedAt: new Date().toISOString(),
        promptsVersion: '2025.01.01.0',
        ruleSets: [{ id: 'base', update: true }],
        settings: { language: 'en' },
        source: 'ai-rules-kit',
        updatedAt: new Date().toISOString(),
    };

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

describe('getInitializedIdes', () => {
    it('должен возвращать пустой массив если ни одна IDE не инициализирована', async () => {
        const testDir = join(tmpdir(), `test-initialized-ides-${Date.now()}`);

        await mkdir(testDir, { recursive: true });

        try {
            const initialized = await getInitializedIdes(testDir);

            expect(initialized).toEqual([]);
        } finally {
            await rm(testDir, { force: true, recursive: true });
        }
    });

    it('должен возвращать массив с одной инициализированной IDE', async () => {
        const testDir = join(tmpdir(), `test-initialized-ides-${Date.now()}`);

        await mkdir(testDir, { recursive: true });

        try {
            await createIdeConfig(testDir, 'cursor');

            const initialized = await getInitializedIdes(testDir);

            expect(initialized).toEqual(['cursor']);
        } finally {
            await rm(testDir, { force: true, recursive: true });
        }
    });

    it('должен возвращать массив с несколькими инициализированными IDE', async () => {
        const testDir = join(tmpdir(), `test-initialized-ides-${Date.now()}`);

        await mkdir(testDir, { recursive: true });

        try {
            await createIdeConfig(testDir, 'cursor');
            await createIdeConfig(testDir, 'trae');

            const initialized = await getInitializedIdes(testDir);

            expect(initialized).toHaveLength(2);
            expect(initialized).toContain('cursor');
            expect(initialized).toContain('trae');
        } finally {
            await rm(testDir, { force: true, recursive: true });
        }
    });

    it('должен возвращать все три IDE когда все инициализированы', async () => {
        const testDir = join(tmpdir(), `test-initialized-ides-${Date.now()}`);

        await mkdir(testDir, { recursive: true });

        try {
            await createIdeConfig(testDir, 'cursor');
            await createIdeConfig(testDir, 'trae');
            await createIdeConfig(testDir, 'claude-code');

            const initialized = await getInitializedIdes(testDir);

            expect(initialized).toEqual(['cursor', 'trae', 'claude-code']);
        } finally {
            await rm(testDir, { force: true, recursive: true });
        }
    });
});

describe('getUninitializedIdes', () => {
    it('должен возвращать все IDE когда ни одна не инициализирована', async () => {
        const testDir = join(tmpdir(), `test-uninitialized-ides-${Date.now()}`);

        await mkdir(testDir, { recursive: true });

        try {
            const uninitialized = await getUninitializedIdes(testDir);

            expect(uninitialized).toEqual(['cursor', 'trae', 'claude-code']);
        } finally {
            await rm(testDir, { force: true, recursive: true });
        }
    });

    it('должен возвращать только не инициализированные IDE', async () => {
        const testDir = join(tmpdir(), `test-uninitialized-ides-${Date.now()}`);

        await mkdir(testDir, { recursive: true });

        try {
            await createIdeConfig(testDir, 'cursor');

            const uninitialized = await getUninitializedIdes(testDir);

            expect(uninitialized).toHaveLength(2);
            expect(uninitialized).toContain('trae');
            expect(uninitialized).toContain('claude-code');
            expect(uninitialized).not.toContain('cursor');
        } finally {
            await rm(testDir, { force: true, recursive: true });
        }
    });

    it('должен возвращать пустой массив когда все IDE инициализированы', async () => {
        const testDir = join(tmpdir(), `test-uninitialized-ides-${Date.now()}`);

        await mkdir(testDir, { recursive: true });

        try {
            await createIdeConfig(testDir, 'cursor');
            await createIdeConfig(testDir, 'trae');
            await createIdeConfig(testDir, 'claude-code');

            const uninitialized = await getUninitializedIdes(testDir);

            expect(uninitialized).toEqual([]);
        } finally {
            await rm(testDir, { force: true, recursive: true });
        }
    });
});

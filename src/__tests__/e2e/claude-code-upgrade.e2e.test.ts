import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { upgradeCommand } from '../../cli/commands/upgrade/index';
import { VERSION_FILE_NAME } from '../../model';
import { copyRulesFixtures } from './helpers/copy-rules-fixtures';
import { tempDir } from './helpers/temp-dir';

// Helper для создания версии файла Claude Code
async function createClaudeCodeVersionFile(targetDir: string, version: string): Promise<void> {
    const { mkdir, writeFile } = await import('node:fs/promises');
    const config = {
        cliVersion: '1.0.0',
        configVersion: '1.0.0',
        fileOverrides: [],
        ideType: 'claude-code',
        ignoreList: [],
        installedAt: new Date().toISOString(),
        promptsVersion: version,
        ruleSets: [{ id: 'base', update: true }],
        settings: { language: 'en' },
        source: 'ai-rules-kit',
        updatedAt: new Date().toISOString(),
    };
    await mkdir(join(targetDir, '.claude'), { recursive: true });
    await writeFile(join(targetDir, '.claude', VERSION_FILE_NAME), JSON.stringify(config, null, 2));
}

vi.mock('../../lib/github-fetcher', () => ({
    fetchPromptsTarball: vi.fn(async (_repo: string, _version: string, targetDir: string) => {
        const { copyRulesFixtures: copyFixtures } = await import('./helpers/copy-rules-fixtures');
        await copyFixtures(targetDir);
    }),
    fetchSystemRulesTarball: vi.fn().mockResolvedValue(undefined),
    getLatestPromptsVersion: vi.fn().mockResolvedValue('2025.11.10.1'),
    getLatestSystemRulesVersion: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../lib/claude-cli/run-claude-init', () => ({
    runClaudeInit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@clack/prompts', () => ({
    isCancel: vi.fn((value) => value === 'cancel'),
    select: vi.fn(),
}));

describe('Claude Code Upgrade E2E', () => {
    let tempDirPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        vi.clearAllMocks();
        // Мокаем select для выбора IDE в тестах
        const { select } = await import('@clack/prompts');
        vi.mocked(select).mockResolvedValue('claude-code');
        tempDirPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPath);
    });

    it('должен выбрасывать ошибку если правила не инициализированы', async () => {
        await expect(upgradeCommand(packageDir, tempDirPath)).rejects.toThrow(
            'Rules not initialized. Run init command first.',
        );
    });

    it('должен пропускать обновление если версии идентичны', { timeout: 30_000 }, async () => {
        await initCommand(packageDir, tempDirPath);

        const configFilePath = join(tempDirPath, '.claude', VERSION_FILE_NAME);
        const configBeforeUpdate = await readFile(configFilePath, 'utf-8');

        await upgradeCommand(packageDir, tempDirPath);

        const configAfterUpdate = await readFile(configFilePath, 'utf-8');

        expect(configBeforeUpdate).toBe(configAfterUpdate);
    });

    it('должен успешно обновлять CLAUDE.md при наличии diff', { timeout: 30_000 }, async () => {
        await copyRulesFixtures(tempDirPath);
        await createClaudeCodeVersionFile(tempDirPath, '2025.11.9.1');

        await upgradeCommand(packageDir, tempDirPath);

        const claudeMdPath = join(tempDirPath, 'CLAUDE.md');
        const content = await readFile(claudeMdPath, 'utf-8');

        expect(content).toContain('AUTO-GENERATED');
        expect(content).toContain('Chat Mode Router');
    });

    it('должен обновлять версию в конфиге', { timeout: 30_000 }, async () => {
        await copyRulesFixtures(tempDirPath);
        await createClaudeCodeVersionFile(tempDirPath, '2025.11.9.1');

        const configFilePath = join(tempDirPath, '.claude', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePath, 'utf-8'));

        await upgradeCommand(packageDir, tempDirPath);

        const contentAfter = JSON.parse(await readFile(configFilePath, 'utf-8'));

        expect(contentAfter.promptsVersion).toBe('2025.11.10.1');
        expect(contentAfter.promptsVersion).not.toBe(contentBefore.promptsVersion);
    });

    it('должен обновлять SKILL.md файлы при обновлении', { timeout: 30_000 }, async () => {
        await copyRulesFixtures(tempDirPath);
        await createClaudeCodeVersionFile(tempDirPath, '2025.11.9.1');

        await upgradeCommand(packageDir, tempDirPath);

        const skillPath = join(tempDirPath, '.claude', 'skills', 'code-workflow', 'SKILL.md');
        const content = await readFile(skillPath, 'utf-8');

        expect(content).toContain('name: code-workflow');
        expect(content).toContain('description:');
    });
});

import { access, constants, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { replaceAllCommand } from '../../cli/commands/replace-all/index';
import type { RulesConfig } from '../../model';
import { CLAUDE_MAIN_FILE_NAME, VERSION_FILE_NAME } from '../../model';
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

describe('Claude Code Replace-All E2E', () => {
    let tempDirPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        vi.clearAllMocks();
        tempDirPath = await tempDir.create();
        await copyRulesFixtures(tempDirPath);
        await createClaudeCodeVersionFile(tempDirPath, '2025.11.9.1');
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPath);
    });

    it('должен успешно выполнять полную замену существующих правил', { timeout: 30_000 }, async () => {
        const configFilePathBefore = join(tempDirPath, '.claude', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePathBefore, 'utf-8')) as RulesConfig;

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDirPath);

        const configFilePathAfter = join(tempDirPath, '.claude', VERSION_FILE_NAME);
        const contentAfter = JSON.parse(await readFile(configFilePathAfter, 'utf-8')) as RulesConfig;

        expect(contentAfter.promptsVersion).toBe('2025.11.10.1');
        expect(contentAfter.promptsVersion).not.toBe(contentBefore.promptsVersion);
        expect(new Date(contentAfter.updatedAt).getTime()).toBeGreaterThan(new Date(contentBefore.updatedAt).getTime());
    });

    it('должен выбрасывать ошибку если package директория недоступна', async () => {
        const nonExistentDir = join(tempDirPath, 'non-existent-package');

        await expect(replaceAllCommand(nonExistentDir, tempDirPath)).rejects.toThrow();
    });

    it('должен создавать CLAUDE.md после замены', async () => {
        await replaceAllCommand(packageDir, tempDirPath);

        const claudeMdPath = join(tempDirPath, CLAUDE_MAIN_FILE_NAME);
        await expect(access(claudeMdPath, constants.F_OK)).resolves.toBeUndefined();

        const content = await readFile(claudeMdPath, 'utf-8');
        expect(content).toContain('AUTO-GENERATED');
    });

    it('должен создавать .claude/skills с SKILL.md файлами', async () => {
        await replaceAllCommand(packageDir, tempDirPath);

        const codeWorkflowSkillPath = join(tempDirPath, '.claude', 'skills', 'code-workflow', 'SKILL.md');
        await expect(access(codeWorkflowSkillPath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен обновлять updatedAt при замене', async () => {
        const configFilePath = join(tempDirPath, '.claude', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampBefore = new Date(contentBefore.updatedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDirPath);

        const contentAfter = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampAfter = new Date(contentAfter.updatedAt).getTime();

        expect(timestampAfter).toBeGreaterThan(timestampBefore);
    });

    it('должен создавать .claude/settings.json', async () => {
        await replaceAllCommand(packageDir, tempDirPath);

        const settingsPath = join(tempDirPath, '.claude', 'settings.json');
        await expect(access(settingsPath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен создавать .claude/docs/docs-catalog.md', async () => {
        await replaceAllCommand(packageDir, tempDirPath);

        const docsCatalogPath = join(tempDirPath, '.claude', 'docs', 'docs-catalog.md');
        await expect(access(docsCatalogPath, constants.F_OK)).resolves.toBeUndefined();
    });
});

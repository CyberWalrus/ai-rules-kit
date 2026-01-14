import { access, constants, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
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
        await copyRulesFixtures(targetDir);
    }),
    fetchSystemRulesTarball: vi.fn().mockResolvedValue(undefined),
    getLatestPromptsVersion: vi.fn().mockResolvedValue('2025.11.10.1'),
    getLatestSystemRulesVersion: vi.fn().mockResolvedValue(null),
}));

vi.mock('@clack/prompts', () => ({
    select: vi.fn().mockResolvedValue('claude-code'),
}));

vi.mock('../../lib/claude-cli/run-claude-init', () => ({
    runClaudeInit: vi.fn().mockResolvedValue(undefined),
}));

describe('Claude Code Init E2E', () => {
    let tempDirPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        vi.clearAllMocks();
        tempDirPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPath);
    });

    it('должен выбрасывать ошибку при инициализации если правила уже установлены', async () => {
        await createClaudeCodeVersionFile(tempDirPath, '2025.11.9.1');

        await expect(initCommand(packageDir, tempDirPath)).rejects.toThrow('Rules already initialized with version');
    });

    it('должен создавать CLAUDE.md файл', async () => {
        await initCommand(packageDir, tempDirPath);

        const claudeMdPath = join(tempDirPath, 'CLAUDE.md');

        await expect(access(claudeMdPath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен создавать .claude директорию', async () => {
        await initCommand(packageDir, tempDirPath);

        const claudeDir = join(tempDirPath, '.claude');

        await expect(access(claudeDir, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен создавать .claude/skills директорию', async () => {
        await initCommand(packageDir, tempDirPath);

        const skillsDir = join(tempDirPath, '.claude', 'skills');

        await expect(access(skillsDir, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен создавать .claude/docs директорию', async () => {
        await initCommand(packageDir, tempDirPath);

        const docsDir = join(tempDirPath, '.claude', 'docs');

        await expect(access(docsDir, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен создавать .claude/commands директорию', async () => {
        await initCommand(packageDir, tempDirPath);

        const commandsDir = join(tempDirPath, '.claude', 'commands');

        await expect(access(commandsDir, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен создавать SKILL.md для alwaysApply: false правил', async () => {
        await initCommand(packageDir, tempDirPath);

        const codeWorkflowSkillPath = join(tempDirPath, '.claude', 'skills', 'code-workflow', 'SKILL.md');

        await expect(access(codeWorkflowSkillPath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен включать alwaysApply: true правила в CLAUDE.md', async () => {
        await initCommand(packageDir, tempDirPath);

        const claudeMdPath = join(tempDirPath, CLAUDE_MAIN_FILE_NAME);
        const content = await readFile(claudeMdPath, 'utf-8');

        expect(content).toContain('AUTO-GENERATED');
        expect(content).toContain('Chat Mode Router');
    });

    it('должен конвертировать rules-catalog.md в docs-catalog.md', async () => {
        await initCommand(packageDir, tempDirPath);

        const docsCatalogPath = join(tempDirPath, '.claude', 'docs', 'docs-catalog.md');

        await expect(access(docsCatalogPath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен создавать .claude/settings.json для MCP серверов', async () => {
        await initCommand(packageDir, tempDirPath);

        const settingsPath = join(tempDirPath, '.claude', 'settings.json');

        await expect(access(settingsPath, constants.F_OK)).resolves.toBeUndefined();
    });
});

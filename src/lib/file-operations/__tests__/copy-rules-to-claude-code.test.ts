/* eslint-disable @typescript-eslint/no-base-to-string */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    BLOCK_END_TAG,
    BLOCK_START_TAG,
    copyRulesToClaudeCode,
    updateClaudeRulesBlock,
} from '../copy-rules-to-claude-code';

vi.mock('node:fs/promises', () => ({
    mkdir: vi.fn(),
    readFile: vi.fn(),
    readdir: vi.fn(),
    writeFile: vi.fn(),
}));

vi.mock('../path-exists', () => ({
    pathExists: vi.fn(),
}));

vi.mock('../replace-placeholders', () => ({
    replacePlaceholders: vi.fn((content: string) => content),
}));

describe('copyRulesToClaudeCode', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        const { mkdir } = await import('node:fs/promises');
        vi.mocked(mkdir).mockResolvedValue(undefined);
    });

    it('должен выбрасывать ошибку при пустом packageDir', async () => {
        await expect(copyRulesToClaudeCode('', '/target')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку при пустом targetDir', async () => {
        await expect(copyRulesToClaudeCode('/source', '')).rejects.toThrow('targetDir is required');
    });

    it('должен возвращать ничего если директория rules не существует', async () => {
        const { pathExists } = await import('../path-exists');
        vi.mocked(pathExists).mockResolvedValue(false);

        await expect(copyRulesToClaudeCode('/source', '/target')).resolves.toBeUndefined();
    });

    it('должен создавать CLAUDE.md с alwaysApply правилами', async () => {
        const { pathExists } = await import('../path-exists');
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');
        const { writeFile } = await import('node:fs/promises');

        vi.mocked(pathExists).mockImplementation((path) => {
            const pathStr = String(path);

            return Promise.resolve(
                pathStr.includes('rules') ||
                    pathStr.includes('docs') ||
                    pathStr.includes('commands') ||
                    pathStr.includes('mcp.json'),
            );
        });

        vi.mocked(readdir).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('rules')) {
                return Promise.resolve([{ isFile: () => true, name: 'rule.md' }] as never);
            }
            if (pathStr.includes('docs')) {
                return Promise.resolve([{ isFile: () => true, name: 'rules-catalog.md' }] as never);
            }

            return Promise.resolve([]);
        });

        const ruleContent = `---
id: test-rule
alwaysApply: true
---
# Rule Content`;

        const catalogContent = '# Rules Catalog\n### Rules Files\n1. Rule';
        const mcpContent = JSON.stringify({ mcpServers: {} });

        vi.mocked(readFile).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('rule.md')) {
                return Promise.resolve(ruleContent);
            }
            if (pathStr.includes('rules-catalog')) {
                return Promise.resolve(catalogContent);
            }
            if (pathStr.includes('mcp.json')) {
                return Promise.resolve(mcpContent);
            }

            return Promise.resolve('');
        });

        await copyRulesToClaudeCode('/source', '/target');

        const writeCalls = vi.mocked(writeFile).mock.calls;
        const claudeMdCall = writeCalls.find((call) => {
            const arg0 = typeof call[0] === 'string' ? call[0] : String(call[0]);

            return arg0.endsWith('CLAUDE.md');
        });
        expect(claudeMdCall).toBeDefined();
        expect(String(claudeMdCall?.[1])).toContain('# Rule Content');
        expect(String(claudeMdCall?.[1])).toContain('AUTO-GENERATED');
    });

    it('должен создавать SKILL.md для alwaysApply: false правил', async () => {
        const { pathExists } = await import('../path-exists');
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');
        const { writeFile } = await import('node:fs/promises');

        vi.mocked(pathExists).mockImplementation((path) => {
            const pathStr = String(path);

            return Promise.resolve(pathStr.includes('rules') || pathStr.includes('docs'));
        });

        vi.mocked(readdir).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('rules')) {
                return Promise.resolve([{ isFile: () => true, name: 'skill-rule.md' }] as never);
            }

            return Promise.resolve([]);
        });

        const skillContent = `---
id: my-skill
alwaysApply: false
description: Test skill
---
# Skill`;
        const mcpContent = JSON.stringify({ mcpServers: {} });

        vi.mocked(readFile).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('mcp.json')) {
                return Promise.resolve(mcpContent);
            }

            return Promise.resolve(skillContent);
        });

        await copyRulesToClaudeCode('/source', '/target');

        const writeCalls = vi.mocked(writeFile).mock.calls;
        const skillCall = writeCalls.find((call) => {
            const arg0 = typeof call[0] === 'string' ? call[0] : String(call[0]);

            return arg0.includes('SKILL.md');
        });
        expect(skillCall).toBeDefined();
        expect(String(skillCall?.[1])).toContain('name: my-skill');
        expect(String(skillCall?.[1])).toContain('description: Test skill');
    });

    it.skip('должен конвертировать rules-catalog.md в docs-catalog.md', async () => {
        const { pathExists } = await import('../path-exists');
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');
        const { writeFile } = await import('node:fs/promises');

        vi.mocked(pathExists).mockImplementation((path) => {
            const pathStr = String(path);

            return Promise.resolve(pathStr.includes('rules') || pathStr.includes('docs'));
        });

        vi.mocked(readdir).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('rules')) {
                return Promise.resolve([]);
            }
            if (pathStr.includes('docs')) {
                return Promise.resolve([{ isFile: () => true, name: 'rules-catalog.md' }] as never);
            }

            return Promise.resolve([]);
        });

        const catalogContent = `# Catalog
### Rules Files
1. Rule 1

### Docs Files
1. Doc 1`;
        const mcpContent = JSON.stringify({ mcpServers: {} });

        vi.mocked(readFile).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('mcp.json')) {
                return Promise.resolve(mcpContent);
            }
            if (pathStr.includes('rules-catalog.md')) {
                return Promise.resolve(catalogContent);
            }

            return Promise.resolve('');
        });

        await copyRulesToClaudeCode('/source', '/target');

        const writeCalls = vi.mocked(writeFile).mock.calls;
        // Проверяем, что writeFile вызывался (для любых файлов)
        expect(writeCalls.length).toBeGreaterThan(0);
        // Ищем вызовы для docs
        const docsCalls = writeCalls.filter((call) => {
            const arg0 = typeof call[0] === 'string' ? call[0] : String(call[0]);

            return arg0.includes('.claude') && arg0.includes('docs');
        });
        // Должен быть хотя бы один вызов для docs
        expect(docsCalls.length).toBeGreaterThan(0);

        // Если есть docs вызовы, проверяем контент
        if (docsCalls.length > 0) {
            const content = String(docsCalls[0]?.[1]);
            expect(content).not.toContain('### Rules Files');
            expect(content).not.toContain('Rule 1');
        }
    });

    it('должен копировать команды в .claude/commands', async () => {
        const { pathExists } = await import('../path-exists');
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');

        vi.mocked(pathExists).mockImplementation((path) => {
            const pathStr = String(path);

            return Promise.resolve(pathStr.includes('rules') || pathStr.includes('commands'));
        });

        vi.mocked(readdir).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('commands')) {
                return Promise.resolve([{ isFile: () => true, name: 'test-cmd.md' }] as never);
            }

            return Promise.resolve([]);
        });

        const commandContent = '# Command';
        const mcpContent = JSON.stringify({ mcpServers: {} });

        vi.mocked(readFile).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('mcp.json')) {
                return Promise.resolve(mcpContent);
            }

            return Promise.resolve(commandContent);
        });

        await copyRulesToClaudeCode('/source', '/target');

        const { writeFile } = await import('node:fs/promises');
        const writeCalls = vi.mocked(writeFile).mock.calls;
        const commandCall = writeCalls.find((call) => {
            const arg0 = typeof call[0] === 'string' ? call[0] : String(call[0]);

            return arg0.includes('commands') && arg0.includes('test-cmd.md');
        });
        expect(commandCall).toBeDefined();
    });

    it('должен конвертировать mcp.json в settings.json', async () => {
        const { pathExists } = await import('../path-exists');
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');

        vi.mocked(pathExists).mockImplementation((path) => {
            const pathStr = String(path);

            return Promise.resolve(pathStr.includes('rules') || pathStr.includes('mcp.json'));
        });

        vi.mocked(readdir).mockResolvedValue([]);

        const mcpContent = JSON.stringify({
            mcpServers: {
                'test-server': {
                    args: ['-y', 'test'],
                    command: 'npx',
                },
            },
        });

        vi.mocked(readFile).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('mcp.json')) {
                return Promise.resolve(mcpContent);
            }

            return Promise.resolve('');
        });

        await copyRulesToClaudeCode('/source', '/target');

        const { writeFile } = await import('node:fs/promises');
        const writeCalls = vi.mocked(writeFile).mock.calls;
        const settingsCall = writeCalls.find((call) => {
            const arg0 = typeof call[0] === 'string' ? call[0] : String(call[0]);

            return arg0.includes('settings.json');
        });
        expect(settingsCall).toBeDefined();

        const settingsContent = String(settingsCall?.[1]);
        const settings = JSON.parse(settingsContent);
        expect(settings.mcpServers).toBeDefined();
        expect(settings.mcpServers['test-server']).toBeDefined();
    });

    it('должен игнорировать файлы из ignoreList', async () => {
        const { pathExists } = await import('../path-exists');
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');

        vi.mocked(pathExists).mockImplementation((path) => {
            const pathStr = String(path);

            return Promise.resolve(pathStr.includes('rules') || pathStr.includes('commands'));
        });

        vi.mocked(readdir).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('commands')) {
                return Promise.resolve([
                    { isFile: () => true, name: 'keep.md' },
                    { isFile: () => true, name: 'ignore.md' },
                ] as never);
            }

            return Promise.resolve([]);
        });

        const content = '# Content';
        const mcpContent = JSON.stringify({ mcpServers: {} });

        vi.mocked(readFile).mockImplementation((path) => {
            const pathStr = String(path);
            if (pathStr.includes('mcp.json')) {
                return Promise.resolve(mcpContent);
            }

            return Promise.resolve(content);
        });

        await copyRulesToClaudeCode('/source', '/target', ['commands/ignore.md']);

        const { writeFile } = await import('node:fs/promises');
        const writeCalls = vi.mocked(writeFile).mock.calls;
        const ignoreCall = writeCalls.find((call) => {
            const arg0 = typeof call[0] === 'string' ? call[0] : String(call[0]);

            return arg0.includes('ignore.md');
        });
        expect(ignoreCall).toBeUndefined();
    });
});

describe('updateClaudeRulesBlock', () => {
    it('должен заменять блок между тегами', async () => {
        const { readFile } = await import('node:fs/promises');
        const { writeFile } = await import('node:fs/promises');

        const existingContent = `# Existing Content

Some existing content.

${BLOCK_START_TAG}

Old block content.

${BLOCK_END_TAG}

More content.`;

        const newBlock = `${BLOCK_START_TAG}

New block content.

${BLOCK_END_TAG}`;

        vi.mocked(readFile).mockResolvedValue(existingContent);

        await updateClaudeRulesBlock('/target/CLAUDE.md', newBlock);

        const writeCalls = vi.mocked(writeFile).mock.calls;
        expect(writeCalls.length).toBe(1);
        const writtenContent = String(writeCalls[0]?.[1]);
        expect(writtenContent).toContain('New block content');
        expect(writtenContent).not.toContain('Old block content');
        expect(writtenContent).toContain('# Existing Content');
        expect(writtenContent).toContain('More content');
    });

    it('должен добавлять блок в конец если теги не найдены', async () => {
        const { readFile } = await import('node:fs/promises');
        const { writeFile } = await import('node:fs/promises');

        const existingContent = '# Existing Content\n\nSome existing content.';
        const newBlock = `${BLOCK_START_TAG}\n\nNew block content.\n\n${BLOCK_END_TAG}`;

        vi.mocked(readFile).mockResolvedValue(existingContent);

        await updateClaudeRulesBlock('/target/CLAUDE.md', newBlock);

        const writeCalls = vi.mocked(writeFile).mock.calls;
        expect(writeCalls.length).toBe(1);
        const writtenContent = String(writeCalls[0]?.[1]);
        expect(writtenContent).toContain('# Existing Content');
        expect(writtenContent).toContain('New block content');
        expect(writtenContent.slice(-1)).toBe('\n');
    });

    it('должен сохранять контент до и после блока', async () => {
        const { readFile } = await import('node:fs/promises');
        const { writeFile } = await import('node:fs/promises');

        const existingContent = `# Start

Content before block.

${BLOCK_START_TAG}

Old content.

${BLOCK_END_TAG}

Content after block.

# End`;

        const newBlock = `${BLOCK_START_TAG}\n\nUpdated content.\n\n${BLOCK_END_TAG}`;

        vi.mocked(readFile).mockResolvedValue(existingContent);

        await updateClaudeRulesBlock('/target/CLAUDE.md', newBlock);

        const writeCalls = vi.mocked(writeFile).mock.calls;
        const writtenContent = String(writeCalls[0]?.[1]);
        expect(writtenContent).toContain('# Start');
        expect(writtenContent).toContain('Content before block');
        expect(writtenContent).toContain('Content after block');
        expect(writtenContent).toContain('# End');
        expect(writtenContent).toContain('Updated content');
        expect(writtenContent).not.toContain('Old content');
    });
});

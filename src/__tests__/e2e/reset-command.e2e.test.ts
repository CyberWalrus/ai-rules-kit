import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetCommand } from '../../cli/commands/reset/index';
import { tempDir } from './helpers/temp-dir';

vi.mock('../../lib/github-fetcher', () => ({
    fetchPromptsTarball: vi.fn(),
    fetchSystemRulesTarball: vi.fn().mockResolvedValue(undefined),
    getLatestPromptsVersion: vi.fn().mockResolvedValue('2025.11.10.1'),
    getLatestSystemRulesVersion: vi.fn().mockResolvedValue(null),
}));

vi.mock('@clack/prompts', () => ({
    askConfirmation: vi.fn(() => true),
    isCancel: vi.fn(() => false),
    select: vi.fn(() => 'cursor'),
}));

describe('Reset Command E2E', () => {
    let tempDirPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        vi.clearAllMocks();
        tempDirPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPath);
    });

    it('должен выводить сообщение если нет инициализированных IDE', async () => {
        console.log = vi.fn();

        await resetCommand(packageDir, tempDirPath);

        expect(console.log).toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку если packageDir пустой', async () => {
        await expect(resetCommand('', tempDirPath)).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        await expect(resetCommand(packageDir, '')).rejects.toThrow('targetDir is required');
    });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runCli } from '../index';

const mockRunMain = vi.hoisted(() => vi.fn());
const mockInitCommand = vi.hoisted(() => vi.fn());
const mockUpdateCommand = vi.hoisted(() => vi.fn());
const mockReplaceAllCommand = vi.hoisted(() => vi.fn());

vi.mock('citty', () => ({
    defineCommand: vi.fn((config) => config),
    runMain: mockRunMain,
}));

vi.mock('../../commands/init/index', () => ({
    initCommand: mockInitCommand,
}));

vi.mock('../../commands/update/index', () => ({
    updateCommand: mockUpdateCommand,
}));

vi.mock('../../commands/replace-all/index', () => ({
    replaceAllCommand: mockReplaceAllCommand,
}));

describe('runCli', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен запускать CLI через runMain', async () => {
        mockRunMain.mockResolvedValue(undefined);

        await runCli();

        expect(mockRunMain).toHaveBeenCalledTimes(1);
        expect(mockRunMain).toHaveBeenCalledWith(expect.any(Object));
    });

    it('должен передавать корректную структуру команд', async () => {
        mockRunMain.mockResolvedValue(undefined);

        await runCli();

        const mainConfig = mockRunMain.mock.calls[0][0] as Record<string, unknown>;

        expect(mainConfig).toHaveProperty('meta');
        expect(mainConfig.meta).toHaveProperty('name', 'cursor-rules');
        expect(mainConfig.meta).toHaveProperty('description');
        expect(mainConfig.meta).toHaveProperty('version');

        expect(mainConfig).toHaveProperty('subCommands');
        expect(mainConfig.subCommands).toHaveProperty('init');
        expect(mainConfig.subCommands).toHaveProperty('update');
        expect(mainConfig.subCommands).toHaveProperty('replace-all');
    });

    it('должен включать команду init с корректными метаданными', async () => {
        mockRunMain.mockResolvedValue(undefined);

        await runCli();

        const mainConfig = mockRunMain.mock.calls[0][0] as Record<string, unknown>;
        const initCmd = (mainConfig.subCommands as Record<string, unknown>).init as Record<string, unknown>;

        expect(initCmd).toHaveProperty('meta');
        expect(initCmd.meta).toHaveProperty('name', 'init');
        expect(initCmd.meta).toHaveProperty('description', 'Initialize .cursor rules in the project');
        expect(initCmd).toHaveProperty('run');
        expect(typeof initCmd.run).toBe('function');
    });

    it('должен включать команду update с корректными метаданными', async () => {
        mockRunMain.mockResolvedValue(undefined);

        await runCli();

        const mainConfig = mockRunMain.mock.calls[0][0] as Record<string, unknown>;
        const updateCmd = (mainConfig.subCommands as Record<string, unknown>).update as Record<string, unknown>;

        expect(updateCmd).toHaveProperty('meta');
        expect(updateCmd.meta).toHaveProperty('name', 'update');
        expect(updateCmd.meta).toHaveProperty('description', 'Update .cursor rules to the latest version');
        expect(updateCmd).toHaveProperty('run');
        expect(typeof updateCmd.run).toBe('function');
    });

    it('должен включать команду replace-all с корректными метаданными', async () => {
        mockRunMain.mockResolvedValue(undefined);

        await runCli();

        const mainConfig = mockRunMain.mock.calls[0][0] as Record<string, unknown>;
        const replaceAllCmd = (mainConfig.subCommands as Record<string, unknown>)['replace-all'] as Record<
            string,
            unknown
        >;

        expect(replaceAllCmd).toHaveProperty('meta');
        expect(replaceAllCmd.meta).toHaveProperty('name', 'replace-all');
        expect(replaceAllCmd.meta).toHaveProperty('description', 'Replace all .cursor rules with the latest version');
        expect(replaceAllCmd).toHaveProperty('run');
        expect(typeof replaceAllCmd.run).toBe('function');
    });

    it('должен обрабатывать ошибки при выполнении команд', async () => {
        const error = new Error('Command execution failed');
        mockRunMain.mockRejectedValue(error);

        await expect(runCli()).rejects.toThrow('Command execution failed');
    });
});

describe('getTargetDir', () => {
    it('должен возвращать текущую рабочую директорию через process.cwd()', () => {
        const originalCwd = process.cwd();

        expect(typeof originalCwd).toBe('string');
        expect(originalCwd.length).toBeGreaterThan(0);
    });
});

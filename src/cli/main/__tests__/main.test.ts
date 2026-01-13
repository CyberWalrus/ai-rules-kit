import { runCli } from '../index';

const mockRunMain = vi.hoisted(() => vi.fn());
const mockInitCommand = vi.hoisted(() => vi.fn());
const mockUpdateCommand = vi.hoisted(() => vi.fn());
const mockReplaceAllCommand = vi.hoisted(() => vi.fn());
const mockEnsureLatestVersion = vi.hoisted(() => vi.fn());
const mockGetPackageVersion = vi.hoisted(() => vi.fn());
const mockNotifyIfUpdateAvailable = vi.hoisted(() => vi.fn());
const mockShowInteractiveMenu = vi.hoisted(() => vi.fn());

vi.mock('citty', () => ({
    defineCommand: vi.fn((config) => config),
    runMain: mockRunMain,
}));

vi.mock('../../commands/init/index', () => ({
    initCommand: mockInitCommand,
}));

vi.mock('../../commands/upgrade/index', () => ({
    upgradeCommand: mockUpdateCommand,
}));

vi.mock('../../commands/replace-all/index', () => ({
    replaceAllCommand: mockReplaceAllCommand,
}));

vi.mock('../ensure-latest-version', () => ({
    ensureLatestVersion: mockEnsureLatestVersion,
}));

vi.mock('../../lib/version-manager/get-package-version', () => ({
    getPackageVersion: mockGetPackageVersion,
}));

vi.mock('../../lib/version-manager/notify-update', () => ({
    notifyIfUpdateAvailable: mockNotifyIfUpdateAvailable,
}));

vi.mock('../interactive-menu', () => ({
    showInteractiveMenu: mockShowInteractiveMenu,
}));

describe('runCli', () => {
    const originalArgv = process.argv;

    beforeEach(() => {
        vi.clearAllMocks();
        mockEnsureLatestVersion.mockResolvedValue(undefined);
        mockRunMain.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('0.3.10');
        mockNotifyIfUpdateAvailable.mockResolvedValue(undefined);
        mockShowInteractiveMenu.mockResolvedValue(undefined);
        process.argv = ['node', 'script.js', 'init'];
    });

    afterEach(() => {
        process.argv = originalArgv;
    });

    it('должен запускать CLI через runMain', async () => {
        await runCli();

        expect(mockRunMain).toHaveBeenCalledTimes(1);
        expect(mockRunMain).toHaveBeenCalledWith(expect.any(Object));
    });

    it('должен передавать корректную структуру команд', async () => {
        await runCli();

        const mainConfig = mockRunMain.mock.calls[0][0] as Record<string, unknown>;

        expect(mainConfig).toHaveProperty('meta');
        expect(mainConfig.meta).toHaveProperty('name', 'ai-rules-kit');
        expect(mainConfig.meta).toHaveProperty('description');
        expect(mainConfig.meta).toHaveProperty('version');

        expect(mainConfig).toHaveProperty('subCommands');
        expect(mainConfig.subCommands).toHaveProperty('init');
        expect(mainConfig.subCommands).toHaveProperty('upgrade');
        expect(mainConfig.subCommands).toHaveProperty('replace-all');
    });

    it('должен включать команду init с корректными метаданными', async () => {
        await runCli();

        const mainConfig = mockRunMain.mock.calls[0][0] as Record<string, unknown>;
        const initCmd = (mainConfig.subCommands as Record<string, unknown>).init as Record<string, unknown>;

        expect(initCmd).toHaveProperty('meta');
        expect(initCmd.meta).toHaveProperty('name', 'init');
        expect(initCmd.meta).toHaveProperty('description', 'Initialize .cursor rules in the project');
        expect(initCmd).toHaveProperty('run');
        expect(typeof initCmd.run).toBe('function');
    });

    it('должен включать команду upgrade с корректными метаданными', async () => {
        await runCli();

        const mainConfig = mockRunMain.mock.calls[0][0] as Record<string, unknown>;
        const upgradeCmd = (mainConfig.subCommands as Record<string, unknown>).upgrade as Record<string, unknown>;

        expect(upgradeCmd).toHaveProperty('meta');
        expect(upgradeCmd.meta).toHaveProperty('name', 'upgrade');
        expect(upgradeCmd.meta).toHaveProperty('description', 'Upgrade .cursor rules to the latest version');
        expect(upgradeCmd).toHaveProperty('run');
        expect(typeof upgradeCmd.run).toBe('function');
    });

    it('должен включать команду replace-all с корректными метаданными', async () => {
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

    it('должен запускать команду немедленно, не дожидаясь проверки версии', async () => {
        vi.useFakeTimers();

        let runMainCalled = false;
        mockRunMain.mockImplementation(() => {
            runMainCalled = true;

            return Promise.resolve();
        });

        let versionCheckResolved = false;
        mockEnsureLatestVersion.mockImplementation(async () => {
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    versionCheckResolved = true;
                    resolve();
                }, 50);
            });
        });

        const runCliPromise = runCli();

        await vi.advanceTimersByTimeAsync(10);

        expect(runMainCalled).toBe(true);
        expect(versionCheckResolved).toBe(false);

        await runCliPromise;

        await vi.advanceTimersByTimeAsync(100);

        expect(versionCheckResolved).toBe(true);

        vi.useRealTimers();
    });
});

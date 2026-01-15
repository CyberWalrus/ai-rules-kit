import { showInteractiveMenu } from '../interactive-menu';

const mockSelect = vi.hoisted(() => vi.fn());
const mockCancel = vi.hoisted(() => vi.fn());
const mockIsCancel = vi.hoisted(() => vi.fn());
const mockIntro = vi.hoisted(() => vi.fn());
const mockOutro = vi.hoisted(() => vi.fn());
const mockGetCurrentVersion = vi.hoisted(() => vi.fn());
const mockGetPackageDir = vi.hoisted(() => vi.fn());
const mockGetTargetDir = vi.hoisted(() => vi.fn());
const mockGetUninitializedIdes = vi.hoisted(() => vi.fn());
const mockInitCommand = vi.hoisted(() => vi.fn());
const mockUpgradeCommand = vi.hoisted(() => vi.fn());
const mockConfigCommand = vi.hoisted(() => vi.fn());
const mockSystemFilesCommand = vi.hoisted(() => vi.fn());
const mockVersionsCommand = vi.hoisted(() => vi.fn());
const mockT = vi.hoisted(() =>
    vi.fn((key: string) => {
        const translations: Record<string, string> = {
            'cli.interactive-menu.cancelled': 'Операция отменена',
            'cli.interactive-menu.config': 'Настройки',
            'cli.interactive-menu.finish': 'Завершить',
            'cli.interactive-menu.goodbye': 'До свидания!',
            'cli.interactive-menu.init': 'Инициализировать правила',
            'cli.interactive-menu.init-other-ide': 'Инициализировать для другой IDE',
            'cli.interactive-menu.select-action': 'Выберите действие:',
            'cli.interactive-menu.system-files': 'Системные файлы',
            'cli.interactive-menu.target-dir-not-found': 'Директория не найдена',
            'cli.interactive-menu.title': 'Cursor Rules CLI',
            'cli.interactive-menu.upgrade': 'Обновить правила',
            'cli.interactive-menu.versions': 'Версии',
            'cli.main.init.success': 'Правила инициализированы',
            'cli.main.package-dir-not-found': 'Директория пакета не найдена',
            'cli.main.upgrade.success': 'Правила обновлены',
        };

        return translations[key] ?? key;
    }),
);

vi.mock('@clack/prompts', () => ({
    cancel: mockCancel,
    intro: mockIntro,
    isCancel: mockIsCancel,
    outro: mockOutro,
    select: mockSelect,
}));

vi.mock('../../../lib/i18n', () => ({
    t: mockT,
}));

vi.mock('../../../lib/version-manager/get-current-version', () => ({
    getCurrentVersion: mockGetCurrentVersion,
}));

vi.mock('../get-package-dir', () => ({
    getPackageDir: mockGetPackageDir,
}));

vi.mock('../get-target-dir', () => ({
    getTargetDir: mockGetTargetDir,
}));

vi.mock('../../../lib/ide-config', () => ({
    getUninitializedIdes: mockGetUninitializedIdes,
}));

vi.mock('../../commands/init', () => ({
    initCommand: mockInitCommand,
}));

vi.mock('../../commands/upgrade', () => ({
    upgradeCommand: mockUpgradeCommand,
}));

vi.mock('../../commands/config', () => ({
    configCommand: mockConfigCommand,
}));

vi.mock('../../commands/system-files', () => ({
    systemFilesCommand: mockSystemFilesCommand,
}));

vi.mock('../../commands/versions', () => ({
    versionsCommand: mockVersionsCommand,
}));

describe('showInteractiveMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsCancel.mockReturnValue(false);
        mockCancel.mockImplementation(() => {});
        mockIntro.mockImplementation(() => {});
        mockOutro.mockImplementation(() => {});
        mockGetTargetDir.mockReturnValue('/test/target');
        mockGetPackageDir.mockReturnValue('/test/package');
        mockGetCurrentVersion.mockResolvedValue(null);
        mockGetUninitializedIdes.mockResolvedValue(['cursor', 'trae', 'claude-code']);
        mockInitCommand.mockResolvedValue(undefined);
        mockUpgradeCommand.mockResolvedValue(undefined);
        mockConfigCommand.mockResolvedValue('finish');
        mockSystemFilesCommand.mockResolvedValue('finish');
        mockVersionsCommand.mockResolvedValue('finish');
    });

    it('должен показывать интро при запуске', async () => {
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        expect(mockIntro).toHaveBeenCalledTimes(1);
    });

    it('должен завершать работу при выборе exit', async () => {
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        expect(mockOutro).toHaveBeenCalledTimes(1);
        expect(mockOutro).toHaveBeenCalledWith(expect.any(String));
    });

    it('должен показывать опцию init если проект не инициализирован', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        expect(mockSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                options: expect.arrayContaining([
                    expect.objectContaining({
                        value: 'init',
                    }),
                ]),
            }),
        );
    });

    it('должен показывать опцию upgrade если проект инициализирован', async () => {
        mockGetCurrentVersion.mockClear();
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        expect(mockGetCurrentVersion).toHaveBeenCalled();
        const selectCall = mockSelect.mock.calls[0][0] as { options: Array<{ value: string }> };
        const hasUpgradeOption = selectCall.options.some((option) => option.value === 'upgrade');

        expect(hasUpgradeOption).toBe(true);
    });

    it('должен показывать опцию init-other-ide если проект инициализирован и есть неинициализированные IDE', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetUninitializedIdes.mockResolvedValue(['trae', 'claude-code']);
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        const selectCall = mockSelect.mock.calls[0][0] as { options: Array<{ value: string }> };
        const hasInitOtherIdeOption = selectCall.options.some((option) => option.value === 'init-other-ide');

        expect(hasInitOtherIdeOption).toBe(true);
    });

    it('не должен показывать опцию init-other-ide если все IDE инициализированы', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetUninitializedIdes.mockResolvedValue([]);
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        const selectCall = mockSelect.mock.calls[0][0] as { options: Array<{ value: string }> };
        const hasInitOtherIdeOption = selectCall.options.some((option) => option.value === 'init-other-ide');

        expect(hasInitOtherIdeOption).toBe(false);
    });

    it('не должен показывать опцию init-other-ide если проект не инициализирован', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockGetUninitializedIdes.mockResolvedValue(['cursor', 'trae', 'claude-code']);
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        const selectCall = mockSelect.mock.calls[0][0] as { options: Array<{ value: string }> };
        const hasInitOtherIdeOption = selectCall.options.some((option) => option.value === 'init-other-ide');

        expect(hasInitOtherIdeOption).toBe(false);
    });

    it('должен вызывать initCommand при выборе init-other-ide', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetUninitializedIdes.mockResolvedValue(['trae', 'claude-code']);
        mockSelect.mockResolvedValueOnce('init-other-ide').mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        expect(mockInitCommand).toHaveBeenCalledTimes(1);
        expect(mockInitCommand).toHaveBeenCalledWith('/test/package', '/test/target');
        expect(mockOutro).toHaveBeenCalledWith(expect.any(String));
    });

    it('должен вызывать initCommand при выборе init', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValueOnce('init').mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        expect(mockInitCommand).toHaveBeenCalledTimes(1);
        expect(mockInitCommand).toHaveBeenCalledWith('/test/package', '/test/target');
        expect(mockOutro).toHaveBeenCalledWith(expect.any(String));
    });

    it('должен вызывать upgradeCommand при выборе upgrade', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockSelect.mockResolvedValueOnce('upgrade').mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        expect(mockUpgradeCommand).toHaveBeenCalledTimes(1);
        expect(mockUpgradeCommand).toHaveBeenCalledWith('/test/package', '/test/target');
        expect(mockOutro).toHaveBeenCalledWith(expect.any(String));
    });

    it('должен вызывать configCommand при выборе config и продолжать цикл если результат не finish', async () => {
        mockConfigCommand.mockResolvedValueOnce('back-to-menu').mockResolvedValue('finish');
        mockSelect.mockResolvedValueOnce('config').mockResolvedValue('exit');

        await showInteractiveMenu('/test/path');

        expect(mockConfigCommand).toHaveBeenCalled();
    });

    it('должен завершать работу при отмене выбора', async () => {
        mockIsCancel.mockReturnValue(true);
        mockSelect.mockResolvedValue(null);

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit called');
        });

        await expect(showInteractiveMenu('/test/path')).rejects.toThrow('exit called');

        expect(mockCancel).toHaveBeenCalledTimes(1);
        expect(exitSpy).toHaveBeenCalledWith(0);

        exitSpy.mockRestore();
    });

    it('должен выбрасывать ошибку если targetDir не найден', async () => {
        mockGetTargetDir.mockReturnValue(null as unknown as string);

        await expect(showInteractiveMenu('/test/path')).rejects.toThrow();
    });

    it('должен выбрасывать ошибку если packageDir не найден', async () => {
        mockGetPackageDir.mockReturnValue(null as unknown as string);
        mockSelect.mockResolvedValue('init');

        await expect(showInteractiveMenu('/test/path')).rejects.toThrow();
    });

    it('должен обрабатывать ошибки при выполнении команд', async () => {
        const error = new Error('Command failed');
        mockInitCommand.mockRejectedValue(error);
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValueOnce('init');

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit called');
        });

        await expect(showInteractiveMenu('/test/path')).rejects.toThrow('exit called');

        expect(mockCancel).toHaveBeenCalledWith('Command failed');
        expect(exitSpy).toHaveBeenCalledWith(1);

        exitSpy.mockRestore();
    });
});

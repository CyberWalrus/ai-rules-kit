import { showInteractiveMenu } from '../interactive-menu';

const mockIntro = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn());
const mockOutro = vi.hoisted(() => vi.fn());
const mockCancel = vi.hoisted(() => vi.fn());
const mockIsCancel = vi.hoisted(() => vi.fn());
const mockInitCommand = vi.hoisted(() => vi.fn());
const mockUpgradeCommand = vi.hoisted(() => vi.fn());
const mockConfigCommand = vi.hoisted(() => vi.fn());
const mockSystemFilesCommand = vi.hoisted(() => vi.fn());
const mockGetPackageDir = vi.hoisted(() => vi.fn());
const mockGetTargetDir = vi.hoisted(() => vi.fn());
const mockGetCurrentVersion = vi.hoisted(() => vi.fn());
const mockT = vi.hoisted(() => vi.fn((key: string) => key));

vi.mock('@clack/prompts', () => ({
    cancel: mockCancel,
    intro: mockIntro,
    isCancel: mockIsCancel,
    outro: mockOutro,
    select: mockSelect,
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

vi.mock('../get-package-dir', () => ({
    getPackageDir: mockGetPackageDir,
}));

vi.mock('../get-target-dir', () => ({
    getTargetDir: mockGetTargetDir,
}));

vi.mock('../../../lib/version-manager/get-current-version', () => ({
    getCurrentVersion: mockGetCurrentVersion,
}));

vi.mock('../../../lib/i18n', () => ({
    t: mockT,
}));

describe('showInteractiveMenu', () => {
    const mockPackageDir = '/mock/package';
    const mockTargetDir = '/mock/target';
    const mockFilePath = '/mock/file.js';

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetPackageDir.mockReturnValue(mockPackageDir);
        mockGetTargetDir.mockReturnValue(mockTargetDir);
        mockGetCurrentVersion.mockResolvedValue(null);
        mockIsCancel.mockReturnValue(false);
        mockInitCommand.mockResolvedValue(undefined);
        mockUpgradeCommand.mockResolvedValue(undefined);
        mockConfigCommand.mockResolvedValue(undefined);
        mockSystemFilesCommand.mockResolvedValue(undefined);
        mockT.mockImplementation((key: string) => {
            const translations: Record<string, string> = {
                'cli.interactive-menu.cancelled': 'Операция отменена',
                'cli.interactive-menu.config': 'Настроить конфигурацию',
                'cli.interactive-menu.config.hint': 'Настройка языка интерфейса, метаинформации и MCP конфигурации',
                'cli.interactive-menu.exit': 'Выход',
                'cli.interactive-menu.goodbye': 'До свидания! 👋',
                'cli.interactive-menu.init': 'Инициализировать правила',
                'cli.interactive-menu.init.hint':
                    'Первая установка правил в проект. Скачивает последнюю версию из GitHub и создает конфигурацию',
                'cli.interactive-menu.select-action': 'Выберите действие:',
                'cli.interactive-menu.system-files': 'Глобальные промпты и конфиги для Cursor',
                'cli.interactive-menu.system-files.hint':
                    'Копирование промптов и правил для пользователя. Вставьте в Cursor: Rules and Commands -> User Rules',
                'cli.interactive-menu.target-dir-not-found': 'Target directory not found',
                'cli.interactive-menu.title': 'cursor-rules-cli',
                'cli.interactive-menu.upgrade': 'Обновить правила',
                'cli.interactive-menu.upgrade.hint':
                    'Обновление с сохранением ignoreList и fileOverrides. Файлы правил перезаписываются новыми версиями',
                'cli.main.config.success': '✅ Конфигурация успешно сохранена',
                'cli.main.init.success': '✅ Rules initialized successfully',
                'cli.main.package-dir-not-found': 'Package directory not found',
                'cli.main.upgrade.success': '✅ Rules upgraded successfully',
            };

            return translations[key] ?? key;
        });
    });

    it('должен показывать intro при запуске', async () => {
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu(mockFilePath);

        expect(mockIntro).toHaveBeenCalledTimes(1);
        expect(mockIntro).toHaveBeenCalledWith('cursor-rules-cli');
    });

    it('должен показывать меню выбора команды когда правила не инициализированы', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu(mockFilePath);

        expect(mockGetCurrentVersion).toHaveBeenCalledWith(mockTargetDir);
        expect(mockSelect).toHaveBeenCalledTimes(1);
        expect(mockSelect).toHaveBeenCalledWith({
            message: 'Выберите действие:',
            options: [
                {
                    hint: 'Первая установка правил в проект. Скачивает последнюю версию из GitHub и создает конфигурацию',
                    label: 'Инициализировать правила',
                    value: 'init',
                },
                {
                    hint: 'Копирование промптов и правил для пользователя. Вставьте в Cursor: Rules and Commands -> User Rules',
                    label: 'Глобальные промпты и конфиги для Cursor',
                    value: 'system-files',
                },
                {
                    hint: 'Настройка языка интерфейса, метаинформации и MCP конфигурации',
                    label: 'Настроить конфигурацию',
                    value: 'config',
                },
                { label: 'Выход', value: 'exit' },
            ],
        });
    });

    it('должен показывать меню выбора команды когда правила инициализированы', async () => {
        mockGetCurrentVersion.mockResolvedValue('2025.11.10.1');
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu(mockFilePath);

        expect(mockGetCurrentVersion).toHaveBeenCalledWith(mockTargetDir);
        expect(mockSelect).toHaveBeenCalledTimes(1);
        expect(mockSelect).toHaveBeenCalledWith({
            message: 'Выберите действие:',
            options: [
                {
                    hint: 'Обновление с сохранением ignoreList и fileOverrides. Файлы правил перезаписываются новыми версиями',
                    label: 'Обновить правила',
                    value: 'upgrade',
                },
                {
                    hint: 'Копирование промптов и правил для пользователя. Вставьте в Cursor: Rules and Commands -> User Rules',
                    label: 'Глобальные промпты и конфиги для Cursor',
                    value: 'system-files',
                },
                {
                    hint: 'Настройка языка интерфейса, метаинформации и MCP конфигурации',
                    label: 'Настроить конфигурацию',
                    value: 'config',
                },
                { label: 'Выход', value: 'exit' },
            ],
        });
    });

    it('должен обрабатывать отмену пользователем (Ctrl+C)', async () => {
        const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
        mockIsCancel.mockReturnValue(true);
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValue('init');

        await showInteractiveMenu(mockFilePath);

        expect(mockIsCancel).toHaveBeenCalledTimes(1);
        expect(mockCancel).toHaveBeenCalledWith('Операция отменена');
        expect(mockExit).toHaveBeenCalledWith(0);

        mockExit.mockRestore();
    });

    it('должен завершаться при выборе exit', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValue('exit');

        await showInteractiveMenu(mockFilePath);

        expect(mockOutro).toHaveBeenCalledWith('До свидания! 👋');
        expect(mockInitCommand).not.toHaveBeenCalled();
        expect(mockUpgradeCommand).not.toHaveBeenCalled();
    });

    it('должен вызывать initCommand при выборе init', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValue('init');

        await showInteractiveMenu(mockFilePath);

        expect(mockGetPackageDir).toHaveBeenCalledWith(mockFilePath);
        expect(mockGetTargetDir).toHaveBeenCalledTimes(1);
        expect(mockGetCurrentVersion).toHaveBeenCalledWith(mockTargetDir);
        expect(mockInitCommand).toHaveBeenCalledWith(mockPackageDir, mockTargetDir);
        expect(mockOutro).toHaveBeenCalledWith('✅ Rules initialized successfully');
    });

    it('должен вызывать upgradeCommand при выборе upgrade', async () => {
        mockGetCurrentVersion.mockResolvedValue('2025.11.10.1');
        mockSelect.mockResolvedValue('upgrade');

        await showInteractiveMenu(mockFilePath);

        expect(mockGetPackageDir).toHaveBeenCalledWith(mockFilePath);
        expect(mockGetTargetDir).toHaveBeenCalledTimes(1);
        expect(mockGetCurrentVersion).toHaveBeenCalledWith(mockTargetDir);
        expect(mockUpgradeCommand).toHaveBeenCalledWith(mockPackageDir, mockTargetDir);
        expect(mockOutro).toHaveBeenCalledWith('✅ Rules upgraded successfully');
    });

    it('должен вызывать configCommand при выборе config', async () => {
        mockGetCurrentVersion.mockResolvedValue('2025.11.10.1');
        mockSelect.mockResolvedValue('config');

        await showInteractiveMenu(mockFilePath);

        expect(mockConfigCommand).toHaveBeenCalledTimes(1);
        expect(mockOutro).toHaveBeenCalledWith('✅ Конфигурация успешно сохранена');
    });

    it('должен вызывать systemFilesCommand при выборе system-files', async () => {
        mockGetCurrentVersion.mockResolvedValue('2025.11.10.1');
        mockSelect.mockResolvedValue('system-files');

        await showInteractiveMenu(mockFilePath);

        expect(mockSystemFilesCommand).toHaveBeenCalledTimes(1);
    });

    it('должен выбрасывать ошибку если packageDir не найден', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValue('init');
        mockGetPackageDir.mockReturnValue(null);

        await expect(showInteractiveMenu(mockFilePath)).rejects.toThrow('Package directory not found');
    });

    it('должен выбрасывать ошибку если targetDir не найден', async () => {
        mockGetTargetDir.mockReturnValue(null);

        await expect(showInteractiveMenu(mockFilePath)).rejects.toThrow('Target directory not found');
    });

    it('должен обрабатывать ошибки команд и вызывать process.exit', async () => {
        const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
        const commandError = new Error('Command failed');
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValue('init');
        mockInitCommand.mockRejectedValue(commandError);

        await showInteractiveMenu(mockFilePath);

        expect(mockCancel).toHaveBeenCalledWith('Command failed');
        expect(mockExit).toHaveBeenCalledWith(1);

        mockExit.mockRestore();
    });

    it('должен обрабатывать не-Error ошибки команд', async () => {
        const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
        mockGetCurrentVersion.mockResolvedValue(null);
        mockSelect.mockResolvedValue('init');
        mockInitCommand.mockRejectedValue('String error');

        await showInteractiveMenu(mockFilePath);

        expect(mockCancel).toHaveBeenCalledWith('String error');
        expect(mockExit).toHaveBeenCalledWith(1);

        mockExit.mockRestore();
    });
});

import { configCommand } from '../index';

const mockSelect = vi.hoisted(() => vi.fn());
const mockCancel = vi.hoisted(() => vi.fn());
const mockIsCancel = vi.hoisted(() => vi.fn());
const mockLog = vi.hoisted(() => ({
    error: vi.fn(),
    success: vi.fn(),
}));
const mockText = vi.hoisted(() => vi.fn());
const mockReadUserConfig = vi.hoisted(() => vi.fn());
const mockWriteUserConfig = vi.hoisted(() => vi.fn());
const mockT = vi.hoisted(() =>
    vi.fn((key: string, params?: Record<string, string>) => {
        const translations: Record<string, string> = {
            'cli.interactive-menu.cancelled': 'Операция отменена',
            'command.config.field.finish': 'Завершить',
            'command.config.field.language': 'Язык',
            'command.config.field.mcp-config': 'MCP конфигурация',
            'command.config.field.meta-info': 'Метаинформация',
            'command.config.language.en': 'English',
            'command.config.language.ru': 'Русский',
            'command.config.select-field': 'Выберите поле:',
            'command.config.select-language': 'Выберите язык интерфейса:',
            'command.config.success': `✓ Язык интерфейса установлен: ${params?.language ?? ''}`,
        };

        return translations[key] ?? key;
    }),
);

const mockOutro = vi.hoisted(() => vi.fn());

vi.mock('@clack/prompts', () => ({
    cancel: mockCancel,
    isCancel: mockIsCancel,
    log: mockLog,
    outro: mockOutro,
    select: mockSelect,
    text: mockText,
}));

vi.mock('../../../../lib/user-config', () => ({
    readUserConfig: mockReadUserConfig,
    writeUserConfig: mockWriteUserConfig,
}));

vi.mock('../../../../lib/i18n', () => ({
    t: mockT,
}));

describe('configCommand', () => {
    const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    beforeEach(() => {
        vi.clearAllMocks();
        mockIsCancel.mockReturnValue(false);
        mockCancel.mockImplementation(() => {});
        mockLog.error.mockImplementation(() => {});
        mockLog.success.mockImplementation(() => {});
        mockOutro.mockImplementation(() => {});
        mockConsoleLog.mockClear();
        mockReadUserConfig.mockResolvedValue(null);
        mockWriteUserConfig.mockResolvedValue(undefined);
        mockSelect.mockResolvedValue('finish');
    });

    it('должен сохранять выбранный язык', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        mockSelect.mockResolvedValueOnce('language').mockResolvedValueOnce('ru').mockResolvedValue('finish');

        await configCommand();

        expect(mockReadUserConfig).toHaveBeenCalled();
        expect(mockSelect).toHaveBeenCalledWith({
            initialValue: 'en',
            message: expect.any(String),
            options: [
                { label: expect.any(String), value: 'en' },
                { label: expect.any(String), value: 'ru' },
            ],
        });
        expect(mockWriteUserConfig).toHaveBeenCalledWith({
            language: 'ru',
        });
    });

    it('должен использовать текущий язык из конфига как initialValue', async () => {
        mockReadUserConfig.mockResolvedValue({ language: 'ru' });
        mockSelect.mockResolvedValueOnce('language').mockResolvedValueOnce('en').mockResolvedValue('finish');

        await configCommand();

        expect(mockSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                initialValue: 'ru',
            }),
        );
    });

    it('должен сохранять существующие поля конфига при обновлении языка', async () => {
        const existingConfig = {
            customField: 'value',
            language: 'en' as const,
        };
        mockReadUserConfig.mockResolvedValue(existingConfig);
        mockSelect.mockResolvedValueOnce('language').mockResolvedValueOnce('ru').mockResolvedValue('finish');

        await configCommand();

        expect(mockWriteUserConfig).toHaveBeenCalledWith({
            ...existingConfig,
            language: 'ru',
        });
    });

    it('должен отменять операцию если пользователь отменил выбор', async () => {
        mockIsCancel.mockReturnValue(true);
        mockSelect.mockResolvedValue(null);

        await configCommand();

        expect(mockCancel).toHaveBeenCalledTimes(1);
        expect(mockWriteUserConfig).not.toHaveBeenCalled();
    });

    it('должен использовать en как язык по умолчанию если конфиг отсутствует', async () => {
        mockSelect.mockResolvedValueOnce('language').mockResolvedValueOnce('en').mockResolvedValue('finish');

        await configCommand();

        expect(mockSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                initialValue: 'en',
            }),
        );
    });

    describe('обработка текстового ввода', () => {
        it('должен корректно обрабатывать пустую строку в mcp-settings', async () => {
            const existingConfig = {
                language: 'en' as const,
                mcpSettings: {
                    aiModel: 'openai/gpt-oss-120b',
                    apiKey: 'test-key',
                    apiProviders: 'test-provider',
                },
            };
            mockReadUserConfig.mockResolvedValue(existingConfig);
            // Выбираем mcp-settings, затем api-providers, вводим пустую строку, завершаем
            mockSelect
                .mockResolvedValueOnce('mcp-settings')
                .mockResolvedValueOnce('api-providers')
                .mockResolvedValueOnce('finish')
                .mockResolvedValueOnce('finish');
            mockText.mockResolvedValue('');

            await configCommand();

            const savedConfig = mockWriteUserConfig.mock.calls[0]?.[0] as { mcpSettings?: { apiProviders?: string } };
            expect(savedConfig.mcpSettings?.apiProviders).toBeUndefined();
        });

        it('должен корректно обрабатывать пустую строку в meta-info полях', async () => {
            const existingConfig = {
                language: 'en' as const,
                metaInfo: {
                    name: 'Test Name',
                },
            };
            mockReadUserConfig.mockResolvedValue(existingConfig);
            mockSelect
                .mockResolvedValueOnce('meta-info')
                .mockResolvedValueOnce('name')
                .mockResolvedValueOnce('finish')
                .mockResolvedValueOnce('finish');
            mockText.mockResolvedValue('');

            await configCommand();

            const savedConfig = mockWriteUserConfig.mock.calls[0]?.[0] as { metaInfo?: { name?: string } };
            expect(savedConfig.metaInfo?.name).toBeUndefined();
        });

        it('должен корректно обрабатывать пустую строку для age', async () => {
            const existingConfig = {
                language: 'en' as const,
                metaInfo: {
                    age: 25,
                },
            };
            mockReadUserConfig.mockResolvedValue(existingConfig);
            mockSelect
                .mockResolvedValueOnce('meta-info')
                .mockResolvedValueOnce('age')
                .mockResolvedValueOnce('finish')
                .mockResolvedValueOnce('finish');
            mockText.mockResolvedValue('');

            await configCommand();

            const savedConfig = mockWriteUserConfig.mock.calls[0]?.[0] as { metaInfo?: { age?: number } };
            expect(savedConfig.metaInfo?.age).toBeUndefined();
        });

        it('должен корректно обрабатывать пустую строку для github-token', async () => {
            const existingConfig = {
                githubToken: 'existing-token',
                language: 'en' as const,
            };
            mockReadUserConfig.mockResolvedValue(existingConfig);
            mockSelect.mockResolvedValueOnce('github-token').mockResolvedValueOnce('finish');
            mockText.mockResolvedValue('');

            await configCommand();

            const savedConfig = mockWriteUserConfig.mock.calls[0]?.[0] as { githubToken?: string };
            expect(savedConfig.githubToken).toBeUndefined();
        });

        it('должен корректно обрабатывать строковые значения после trim', async () => {
            const existingConfig = {
                language: 'en' as const,
                metaInfo: {
                    name: '  Test Name  ',
                },
            };
            mockReadUserConfig.mockResolvedValue(existingConfig);
            mockSelect
                .mockResolvedValueOnce('meta-info')
                .mockResolvedValueOnce('name')
                .mockResolvedValueOnce('finish')
                .mockResolvedValueOnce('finish');
            mockText.mockResolvedValue('  New Name  ');

            await configCommand();

            const savedConfig = mockWriteUserConfig.mock.calls[0]?.[0] as { metaInfo?: { name?: string } };
            expect(savedConfig.metaInfo?.name).toBe('New Name');
        });
    });
});

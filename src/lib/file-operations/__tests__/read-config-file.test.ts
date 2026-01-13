import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createTestConfig } from '../../../__tests__/helpers/create-test-config';
import type { RulesConfig } from '../../../model';
import { readConfigFile } from '../read-config-file';

function getTestPath(...segments: string[]): string {
    return join(tmpdir(), 'cursor-rules-test', ...segments);
}

const { mockReadFile, mockPathExists, mockWriteFile, mockMkdir } = vi.hoisted(() => ({
    mockMkdir: vi.fn(),
    mockPathExists: vi.fn(),
    mockReadFile: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    mkdir: mockMkdir,
    readFile: mockReadFile,
    writeFile: mockWriteFile,
}));

vi.mock('../path-exists', () => ({
    pathExists: mockPathExists,
}));

const { mockWriteConfigFile } = vi.hoisted(() => ({
    mockWriteConfigFile: vi.fn(),
}));

vi.mock('../write-config-file', () => ({
    writeConfigFile: mockWriteConfigFile,
}));

describe('readConfigFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен читать и парсить файл конфигурации', async () => {
        const config: RulesConfig = createTestConfig();

        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(config));

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).toEqual(config);
        expect(mockPathExists).toHaveBeenCalled();
        expect(mockReadFile).toHaveBeenCalledWith(join(targetDir, '.cursor', 'ai-rules-kit-config.json'), 'utf-8');
    });

    it('должен возвращать null если файл не существует', async () => {
        mockPathExists.mockResolvedValue(false);

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).toBeNull();
        expect(mockPathExists).toHaveBeenCalled();
        expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('должен возвращать null при ошибке парсинга JSON', async () => {
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue('invalid json');

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).toBeNull();
    });

    it('должен возвращать null при ошибке валидации схемы', async () => {
        const invalidConfig = {
            version: '1.0.0',
        };

        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(invalidConfig));

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).toBeNull();
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        await expect(readConfigFile('')).rejects.toThrow('targetDir is required');
    });

    it('должен обновлять старую ссылку на схему при чтении конфига', async () => {
        const config: RulesConfig = createTestConfig();
        const oldConfigContent = {
            $schema:
                'https://raw.githubusercontent.com/CyberWalrus/cursor-rules-cli/main/.cursor/ai-rules-kit-config-1.0.0.schema.json',
            ...config,
        };

        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(oldConfigContent));
        mockWriteConfigFile.mockResolvedValue(undefined);

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).not.toBeNull();
        expect(result?.configVersion).toBe(config.configVersion);
        expect(mockWriteConfigFile).toHaveBeenCalledWith(
            join(targetDir, '.cursor'),
            expect.objectContaining({ configVersion: '1.0.0' }),
            'cursor',
        );
    });
});

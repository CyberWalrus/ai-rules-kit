import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createTestConfig } from '../../../__tests__/helpers/create-test-config';
import type { RulesConfig } from '../../../model';
import { writeConfigFile } from '../write-config-file';

function getTestPath(...segments: string[]): string {
    return join(tmpdir(), 'cursor-rules-test', ...segments);
}

const { mockMkdir, mockWriteFile } = vi.hoisted(() => ({
    mockMkdir: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
}));

describe('writeConfigFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен записывать файл конфигурации с правильным форматированием', async () => {
        const config: RulesConfig = createTestConfig();

        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        const targetDir = getTestPath('target');

        await writeConfigFile(targetDir, config, 'cursor');

        expect(mockMkdir).toHaveBeenCalledWith(join(targetDir, '.cursor'), { recursive: true });
        const expectedConfig = {
            $schema: `https://raw.githubusercontent.com/CyberWalrus/ai-rules-kit/main/schemas/ai-rules-kit-config-${config.configVersion}.schema.json`,
            ...config,
            ideType: 'cursor',
        };
        expect(mockWriteFile).toHaveBeenCalledWith(
            join(targetDir, '.cursor', 'ai-rules-kit-config.json'),
            JSON.stringify(expectedConfig, null, 2),
            'utf8',
        );
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        const config: RulesConfig = createTestConfig();

        await expect(writeConfigFile('', config, 'cursor')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если config null', async () => {
        const targetDir = getTestPath('target');

        await expect(writeConfigFile(targetDir, null as unknown as RulesConfig, 'cursor')).rejects.toThrow(
            'config is required',
        );
    });

    it('должен выбрасывать ошибку если config undefined', async () => {
        const targetDir = getTestPath('target');

        await expect(writeConfigFile(targetDir, undefined as unknown as RulesConfig, 'cursor')).rejects.toThrow(
            'config is required',
        );
    });

    it('должен обрабатывать ошибки записи файла', async () => {
        const config: RulesConfig = createTestConfig();

        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockRejectedValue(new Error('Write failed'));

        const targetDir = getTestPath('target');

        await expect(writeConfigFile(targetDir, config, 'cursor')).rejects.toThrow('Failed to write config file');
    });
});

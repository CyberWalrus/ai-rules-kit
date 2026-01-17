import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createTestConfig } from '../../../__tests__/helpers/create-test-config';
import type { RulesConfig } from '../../../model';
import { copyRulesToTarget, deleteRulesFromTarget, readConfigFile, writeConfigFile } from '../index';

function getTestPath(...segments: string[]): string {
    return join(tmpdir(), 'cursor-rules-test', ...segments);
}

const { mockCp, mockAccess, mockMkdir, mockReadFile, mockRm, mockWriteFile, mockPathExists, mockReaddir } = vi.hoisted(
    () => ({
        mockAccess: vi.fn(),
        mockCp: vi.fn(),
        mockMkdir: vi.fn(),
        mockPathExists: vi.fn(),
        mockReadFile: vi.fn(),
        mockReaddir: vi.fn(),
        mockRm: vi.fn(),
        mockWriteFile: vi.fn(),
    }),
);

vi.mock('node:fs/promises', () => ({
    access: mockAccess,
    constants: { F_OK: 0 },
    cp: mockCp,
    mkdir: mockMkdir,
    readFile: mockReadFile,
    readdir: mockReaddir,
    rm: mockRm,
    writeFile: mockWriteFile,
}));

vi.mock('../path-exists', () => ({
    pathExists: mockPathExists,
}));

vi.mock('../apply-yaml-overrides', () => ({
    applyYamlOverrides: vi.fn(),
}));

vi.mock('../should-ignore-file', () => ({
    shouldIgnoreFile: vi.fn(() => false),
}));

describe('file-operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('copyRulesToTarget', () => {
        it('должен копировать существующие директории правил', async () => {
            mockPathExists.mockResolvedValue(true);
            mockReaddir.mockResolvedValue([{ isDirectory: () => false, isFile: () => true, name: 'file1.mdc' }]);
            mockReadFile.mockResolvedValue('test content');
            mockMkdir.mockResolvedValue(undefined);
            mockCp.mockResolvedValue(undefined);

            const packageDir = getTestPath('package');
            const targetDir = getTestPath('target');

            await copyRulesToTarget(packageDir, targetDir, 'cursor');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReaddir).toHaveBeenCalled();
        });

        it('должен пропускать несуществующие директории', async () => {
            mockPathExists.mockResolvedValue(false);

            const packageDir = getTestPath('package');
            const targetDir = getTestPath('target');

            await copyRulesToTarget(packageDir, targetDir, 'cursor');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReaddir).not.toHaveBeenCalled();
        });
    });

    describe('deleteRulesFromTarget', () => {
        it('должен удалять существующие директории правил', async () => {
            mockPathExists.mockResolvedValue(true);
            mockRm.mockResolvedValue(undefined);

            const targetDir = getTestPath('target');

            await deleteRulesFromTarget(targetDir, 'cursor');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockRm).toHaveBeenCalled();
        });

        it('должен пропускать несуществующие директории', async () => {
            mockPathExists.mockResolvedValue(false);

            const targetDir = getTestPath('target');

            await deleteRulesFromTarget(targetDir, 'cursor');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockRm).not.toHaveBeenCalled();
        });
    });

    describe('readConfigFile', () => {
        it('должен читать и парсить файл конфигурации', async () => {
            const config: RulesConfig = createTestConfig();

            mockPathExists.mockResolvedValue(true);
            mockReadFile.mockResolvedValue(JSON.stringify(config));

            const targetDir = getTestPath('target');

            const result = await readConfigFile(targetDir);

            expect(result).toEqual(config);
            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReadFile).toHaveBeenCalledWith(join(targetDir, '.cursor', 'ai-rules-kit-config.json'), 'utf8');
        });

        it('должен возвращать null если файл не существует', async () => {
            mockPathExists.mockResolvedValue(false);

            const targetDir = getTestPath('target');

            const result = await readConfigFile(targetDir);

            expect(result).toBeNull();
            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReadFile).not.toHaveBeenCalled();
        });
    });

    describe('writeConfigFile', () => {
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
    });
});

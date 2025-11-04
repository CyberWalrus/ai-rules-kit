import type { VersionInfo } from '../../../model/types/main';
import { copyRulesToTarget, deleteRulesFromTarget, readVersionFile, writeVersionFile } from '../index';

const { mockCp, mockAccess, mockMkdir, mockReadFile, mockRm, mockWriteFile, mockPathExists } = vi.hoisted(() => ({
    mockAccess: vi.fn(),
    mockCp: vi.fn(),
    mockMkdir: vi.fn(),
    mockPathExists: vi.fn(),
    mockReadFile: vi.fn(),
    mockRm: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    access: mockAccess,
    constants: { F_OK: 0 },
    cp: mockCp,
    mkdir: mockMkdir,
    readFile: mockReadFile,
    rm: mockRm,
    writeFile: mockWriteFile,
}));

vi.mock('../path-exists', () => ({
    pathExists: mockPathExists,
}));

describe('file-operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('copyRulesToTarget', () => {
        it('должен копировать существующие директории правил', async () => {
            mockPathExists.mockResolvedValue(true);
            mockCp.mockResolvedValue(undefined);

            await copyRulesToTarget('/package', '/target');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockCp).toHaveBeenCalled();
        });

        it('должен пропускать несуществующие директории', async () => {
            mockPathExists.mockResolvedValue(false);

            await copyRulesToTarget('/package', '/target');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockCp).not.toHaveBeenCalled();
        });
    });

    describe('deleteRulesFromTarget', () => {
        it('должен удалять существующие директории правил', async () => {
            mockPathExists.mockResolvedValue(true);
            mockRm.mockResolvedValue(undefined);

            await deleteRulesFromTarget('/target');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockRm).toHaveBeenCalled();
        });

        it('должен пропускать несуществующие директории', async () => {
            mockPathExists.mockResolvedValue(false);

            await deleteRulesFromTarget('/target');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockRm).not.toHaveBeenCalled();
        });
    });

    describe('readVersionFile', () => {
        it('должен читать и парсить файл версии', async () => {
            const versionInfo: VersionInfo = {
                installedAt: '2025-11-01T12:00:00.000Z',
                source: 'cursor-rules',
                version: '1.0.0',
            };

            mockPathExists.mockResolvedValue(true);
            mockReadFile.mockResolvedValue(JSON.stringify(versionInfo));

            const result = await readVersionFile('/target');

            expect(result).toEqual(versionInfo);
            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReadFile).toHaveBeenCalledWith(expect.stringContaining('.cursor/rules-version.json'), 'utf-8');
        });

        it('должен возвращать null если файл не существует', async () => {
            mockPathExists.mockResolvedValue(false);

            const result = await readVersionFile('/target');

            expect(result).toBeNull();
            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReadFile).not.toHaveBeenCalled();
        });
    });

    describe('writeVersionFile', () => {
        it('должен записывать файл версии с правильным форматированием', async () => {
            const versionInfo: VersionInfo = {
                installedAt: '2025-11-01T12:00:00.000Z',
                source: 'cursor-rules',
                version: '1.0.0',
            };

            mockMkdir.mockResolvedValue(undefined);
            mockWriteFile.mockResolvedValue(undefined);

            await writeVersionFile('/target', versionInfo);

            expect(mockMkdir).toHaveBeenCalledWith('/target/.cursor', { recursive: true });
            expect(mockWriteFile).toHaveBeenCalledWith(
                expect.stringContaining('.cursor/rules-version.json'),
                JSON.stringify(versionInfo, null, 2),
                'utf-8',
            );
        });
    });
});

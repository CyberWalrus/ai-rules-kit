import { join } from 'node:path';

import { deleteConfigFile } from '../delete-config';

const { mockRm, mockPathExists } = vi.hoisted(() => ({
    mockPathExists: vi.fn(),
    mockRm: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    rm: mockRm,
}));

vi.mock('../path-exists', () => ({
    pathExists: mockPathExists,
}));

describe('deleteConfigFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен удалять конфигурационный файл для Cursor', async () => {
        mockPathExists.mockResolvedValue(true);
        mockRm.mockResolvedValue(undefined);

        const targetDir = '/test/project';
        await deleteConfigFile(targetDir, 'cursor');

        expect(mockRm).toHaveBeenCalledWith(join(targetDir, '.cursor', 'ai-rules-kit-config.json'), {
            force: true,
        });
    });

    it('должен удалять конфигурационный файл для TRAE', async () => {
        mockPathExists.mockResolvedValue(true);
        mockRm.mockResolvedValue(undefined);

        const targetDir = '/test/project';
        await deleteConfigFile(targetDir, 'trae');

        expect(mockRm).toHaveBeenCalledWith(join(targetDir, '.trae', 'ai-rules-kit-config.json'), {
            force: true,
        });
    });

    it('должен удалять конфигурационный файл для Claude Code', async () => {
        mockPathExists.mockResolvedValue(true);
        mockRm.mockResolvedValue(undefined);

        const targetDir = '/test/project';
        await deleteConfigFile(targetDir, 'claude-code');

        expect(mockRm).toHaveBeenCalledWith(join(targetDir, '.claude', 'ai-rules-kit-config.json'), {
            force: true,
        });
    });

    it('должен удалять settings.json для Claude Code', async () => {
        mockPathExists.mockResolvedValue(true);
        mockRm.mockResolvedValue(undefined);

        const targetDir = '/test/project';
        await deleteConfigFile(targetDir, 'claude-code');

        expect(mockRm).toHaveBeenCalledWith(join(targetDir, '.claude', 'settings.json'), {
            force: true,
        });
    });

    it('не должен удалять settings.json для других IDE', async () => {
        mockPathExists.mockResolvedValue(true);
        mockRm.mockResolvedValue(undefined);

        const targetDir = '/test/project';
        await deleteConfigFile(targetDir, 'cursor');

        expect(mockRm).toHaveBeenCalledTimes(1);
        expect(mockRm).toHaveBeenCalledWith(join(targetDir, '.cursor', 'ai-rules-kit-config.json'), {
            force: true,
        });
    });

    it('должен пропускать удаление если конфиг не существует', async () => {
        mockPathExists.mockResolvedValue(false);
        mockRm.mockResolvedValue(undefined);

        const targetDir = '/test/project';
        await deleteConfigFile(targetDir, 'cursor');

        expect(mockRm).not.toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        await expect(deleteConfigFile('', 'cursor')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir undefined', async () => {
        await expect(deleteConfigFile(undefined as unknown as string, 'cursor')).rejects.toThrow(
            'targetDir is required',
        );
    });
});

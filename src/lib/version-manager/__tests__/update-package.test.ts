import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updatePackage } from '../update-package';

const { mockExecAsync } = vi.hoisted(() => ({
    mockExecAsync: vi.fn(),
}));

vi.mock('node:child_process', () => ({
    exec: vi.fn(),
}));

vi.mock('node:util', () => ({
    promisify: vi.fn(() => mockExecAsync),
}));

describe('updatePackage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен обновлять пакет через npm', async () => {
        mockExecAsync.mockResolvedValue({ stderr: '', stdout: '' });

        await updatePackage('test-package');

        expect(mockExecAsync).toHaveBeenCalledWith('npm install -g test-package@latest');
    });

    it('должен выбрасывать ошибку если packageName пустой', async () => {
        await expect(updatePackage('')).rejects.toThrow('packageName is required');
    });

    it('должен выбрасывать ошибку если packageName null', async () => {
        await expect(updatePackage(null as unknown as string)).rejects.toThrow('packageName is required');
    });

    it('должен выбрасывать ошибку если packageName undefined', async () => {
        await expect(updatePackage(undefined as unknown as string)).rejects.toThrow('packageName is required');
    });

    it('должен обрабатывать предупреждения npm', async () => {
        mockExecAsync.mockResolvedValue({ stderr: 'npm WARN deprecated package', stdout: '' });

        await expect(updatePackage('test-package')).resolves.not.toThrow();
    });

    it('должен выбрасывать ошибку если stderr содержит ошибку', async () => {
        mockExecAsync.mockResolvedValue({ stderr: 'npm error: failed to install', stdout: '' });

        await expect(updatePackage('test-package')).rejects.toThrow('npm install failed');
    });

    it('должен выбрасывать ошибку если exec завершается с кодом ошибки', async () => {
        const execError = new Error('Command failed') as Error & { code?: number };
        execError.code = 1;

        mockExecAsync.mockRejectedValue(execError);

        await expect(updatePackage('test-package')).rejects.toThrow(
            'Failed to update package: process exited with code 1',
        );
    });

    it('должен обрабатывать ошибки выполнения команды', async () => {
        const execError = new Error('Command execution failed');

        mockExecAsync.mockRejectedValue(execError);

        await expect(updatePackage('test-package')).rejects.toThrow(
            'Failed to update package: Command execution failed',
        );
    });
});

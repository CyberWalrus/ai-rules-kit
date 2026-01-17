import { spawn } from 'node:child_process';

import { copyToClipboard } from '../copy-to-clipboard';

vi.mock('node:child_process', () => ({
    spawn: vi.fn(),
}));

const mockSpawn = vi.mocked(spawn);

describe('copyToClipboard', () => {
    let mockProcess: {
        on: ReturnType<typeof vi.fn>;
        stdin: { end: ReturnType<typeof vi.fn>; write: ReturnType<typeof vi.fn> };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockProcess = {
            on: vi.fn(),
            stdin: {
                end: vi.fn(),
                write: vi.fn(),
            },
        };
        mockSpawn.mockReturnValue(mockProcess as never);
    });

    it('должен копировать текст в буфер обмена на macOS', async () => {
        Object.defineProperty(process, 'platform', {
            value: 'darwin',
            writable: true,
        });

        const promise = copyToClipboard('test text');
        mockProcess.on.mock.calls.find((call) => call[0] === 'close')?.[1]?.(0);

        await promise;

        expect(mockSpawn).toHaveBeenCalledWith('pbcopy', [], {
            stdio: ['pipe', 'ignore', 'ignore'],
        });
        expect(mockProcess.stdin.write).toHaveBeenCalledWith('test text', 'utf8');
        expect(mockProcess.stdin.end).toHaveBeenCalled();
    });

    it('должен копировать текст в буфер обмена на Windows', async () => {
        Object.defineProperty(process, 'platform', {
            value: 'win32',
            writable: true,
        });

        const promise = copyToClipboard('test text');
        mockProcess.on.mock.calls.find((call) => call[0] === 'close')?.[1]?.(0);

        await promise;

        expect(mockSpawn).toHaveBeenCalledWith('clip', [], {
            stdio: ['pipe', 'ignore', 'ignore'],
        });
    });

    it('должен копировать текст в буфер обмена на Linux', async () => {
        Object.defineProperty(process, 'platform', {
            value: 'linux',
            writable: true,
        });

        const promise = copyToClipboard('test text');
        mockProcess.on.mock.calls.find((call) => call[0] === 'close')?.[1]?.(0);

        await promise;

        expect(mockSpawn).toHaveBeenCalledWith('xclip', ['-selection', 'clipboard'], {
            stdio: ['pipe', 'ignore', 'ignore'],
        });
    });

    it('должен выбрасывать ошибку если текст не передан', async () => {
        await expect(copyToClipboard(null as never)).rejects.toThrow('text is required');
        await expect(copyToClipboard(undefined as never)).rejects.toThrow('text is required');
    });

    it('должен выбрасывать ошибку если команда завершилась с ошибкой', async () => {
        Object.defineProperty(process, 'platform', {
            value: 'darwin',
            writable: true,
        });

        const promise = copyToClipboard('test text');
        mockProcess.on.mock.calls.find((call) => call[0] === 'close')?.[1]?.(1);

        await expect(promise).rejects.toThrow('Command failed with code 1');
    });

    it('должен выбрасывать ошибку если процесс завершился с ошибкой', async () => {
        Object.defineProperty(process, 'platform', {
            value: 'darwin',
            writable: true,
        });

        const promise = copyToClipboard('test text');
        const errorHandler = mockProcess.on.mock.calls.find((call) => call[0] === 'error')?.[1];
        if (errorHandler) {
            errorHandler(new Error('Process error'));
        }

        await expect(promise).rejects.toThrow('Failed to copy to clipboard: Process error');
    });
});

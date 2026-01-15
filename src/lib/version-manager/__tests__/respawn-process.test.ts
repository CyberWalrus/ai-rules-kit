import { spawn } from 'node:child_process';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { respawnProcess } from '../respawn-process';

vi.mock('node:child_process');

describe('respawnProcess', () => {
    const originalArgv = process.argv;
    const originalExit = process.exit;

    beforeEach(() => {
        vi.clearAllMocks();
        process.argv = ['/usr/local/bin/node', '/usr/local/bin/ai-rules-kit', 'update'];
        process.exit = vi.fn() as never;
    });

    afterEach(() => {
        process.argv = originalArgv;
        process.exit = originalExit;
    });

    it('должен вызвать spawn с правильными аргументами', () => {
        const mockSpawn = vi.mocked(spawn);

        respawnProcess();

        expect(mockSpawn).toHaveBeenCalledTimes(1);
        expect(mockSpawn).toHaveBeenCalledWith('/usr/local/bin/node', ['/usr/local/bin/ai-rules-kit', 'update'], {
            detached: true,
            stdio: 'inherit',
        });
    });

    it('должен завершить текущий процесс после spawn', () => {
        const mockExit = vi.mocked(process.exit);

        respawnProcess();

        expect(mockExit).toHaveBeenCalledTimes(1);
        expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('должен обрабатывать process.argv с несколькими аргументами', () => {
        process.argv = ['/usr/bin/node', '/usr/bin/crules', 'init', '--force'];
        const mockSpawn = vi.mocked(spawn);

        respawnProcess();

        expect(mockSpawn).toHaveBeenCalledWith('/usr/bin/node', ['/usr/bin/crules', 'init', '--force'], {
            detached: true,
            stdio: 'inherit',
        });
    });

    it('должен работать когда process.argv содержит только исполняемый файл и скрипт', () => {
        process.argv = ['/usr/local/bin/node', '/usr/local/bin/ai-rules-kit'];
        const mockSpawn = vi.mocked(spawn);

        respawnProcess();

        expect(mockSpawn).toHaveBeenCalledWith('/usr/local/bin/node', ['/usr/local/bin/ai-rules-kit'], {
            detached: true,
            stdio: 'inherit',
        });
    });
});

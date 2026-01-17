import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getInitializedIdes } from '../../../../lib/ide-config/get-initialized-ides';
import { resetCommand } from '../index';

vi.mock('../../../../lib/file-operations');
vi.mock('../../../../lib/ide-config/get-initialized-ides');
vi.mock('../../../../lib/helpers', () => ({
    askConfirmation: vi.fn(() => Promise.resolve(true)),
    isEmptyString: vi.fn(() => false),
}));
vi.mock('../../../../lib/i18n', () => ({
    t: vi.fn((key: string) => {
        if (key === 'command.reset.no-initialized') {
            return 'No initialized IDEs';
        }

        return key;
    }),
}));
vi.mock('@clack/prompts', async () => {
    const actual = await vi.importActual('@clack/prompts');

    return {
        ...actual,
        isCancel: vi.fn(() => false),
        select: vi.fn(() => 'cursor'),
    };
});

const mockGetInitializedIdes = vi.mocked(getInitializedIdes);

describe('resetCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        console.log = vi.fn();
    });

    it('должен выводить сообщение если нет инициализированных IDE', async () => {
        mockGetInitializedIdes.mockResolvedValue([]);

        await resetCommand('/package', '/target');

        expect(console.log).toHaveBeenCalledWith('No initialized IDEs');
    }, 10000);

    it('должен выбрасывать ошибку если packageDir пустой', async () => {
        await expect(resetCommand('', '/target')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        await expect(resetCommand('/package', '')).rejects.toThrow('targetDir is required');
    });
});

import { confirm, isCancel } from '@clack/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { askConfirmation } from '../ask-confirmation';

vi.mock('@clack/prompts', () => ({
    confirm: vi.fn(),
    isCancel: vi.fn(),
}));

describe('askConfirmation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(isCancel).mockReturnValue(false);
    });

    it('должен возвращать true когда пользователь подтверждает', async () => {
        vi.mocked(confirm).mockResolvedValue(true);

        const result = await askConfirmation('Test question');

        expect(result).toBe(true);
        expect(confirm).toHaveBeenCalledWith({
            active: 'Да',
            inactive: 'Нет',
            initialValue: false,
            message: 'Test question',
        });
    });

    it('должен возвращать false когда пользователь отказывает', async () => {
        vi.mocked(confirm).mockResolvedValue(false);

        const result = await askConfirmation('Test question');

        expect(result).toBe(false);
        expect(confirm).toHaveBeenCalledWith({
            active: 'Да',
            inactive: 'Нет',
            initialValue: false,
            message: 'Test question',
        });
    });

    it('должен возвращать false при отмене (Ctrl+C)', async () => {
        const cancelSymbol = Symbol('cancel');
        vi.mocked(confirm).mockResolvedValue(cancelSymbol as never);
        vi.mocked(isCancel).mockReturnValue(true);

        const result = await askConfirmation('Test question');

        expect(result).toBe(false);
        expect(isCancel).toHaveBeenCalledWith(cancelSymbol);
    });

    it('должен выбрасывать ошибку если question равен null', async () => {
        await expect(askConfirmation(null as never)).rejects.toThrow('question is required');
    });

    it('должен выбрасывать ошибку если question равен undefined', async () => {
        await expect(askConfirmation(undefined as never)).rejects.toThrow('question is required');
    });

    it('должен выбрасывать ошибку если question равен пустой строке', async () => {
        await expect(askConfirmation('')).rejects.toThrow('question is required');
    });

    it('должен пробрасывать ошибку от confirm', async () => {
        vi.mocked(confirm).mockRejectedValue(new Error('Test error'));

        await expect(askConfirmation('Test question')).rejects.toThrow('Test error');
    });
});

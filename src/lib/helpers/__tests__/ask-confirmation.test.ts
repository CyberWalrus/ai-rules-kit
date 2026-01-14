import { beforeEach, describe, expect, it, vi } from 'vitest';

import { askConfirmation } from '../ask-confirmation';

vi.mock('node:readline/promises', () => ({
    createInterface: vi.fn(),
}));

vi.mock('node:process', () => ({
    env: {},
    stdin: {},
    stdout: {},
}));

describe('askConfirmation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        ['y', true],
        ['yes', true],
        ['Y', true],
        ['YES', true],
    ])('должен возвращать true для ответа "%s"', async (answer, expected) => {
        const { createInterface } = await import('node:readline/promises');
        const mockQuestion = vi.fn().mockResolvedValue(answer);
        const mockClose = vi.fn();

        vi.mocked(createInterface).mockReturnValue({
            close: mockClose,
            question: mockQuestion,
        } as never);

        const result = await askConfirmation('Test question');

        expect(result).toBe(expected);
        expect(mockQuestion).toHaveBeenCalledWith('Test question (y/n): ');
        expect(mockClose).toHaveBeenCalled();
    });

    it.each([
        ['n', false],
        ['no', false],
        ['N', false],
        ['NO', false],
    ])('должен возвращать false для ответа "%s"', async (answer, expected) => {
        const { createInterface } = await import('node:readline/promises');
        const mockQuestion = vi.fn().mockResolvedValue(answer);
        const mockClose = vi.fn();

        vi.mocked(createInterface).mockReturnValue({
            close: mockClose,
            question: mockQuestion,
        } as never);

        const result = await askConfirmation('Test question');

        expect(result).toBe(expected);
        expect(mockClose).toHaveBeenCalled();
    });

    it('должен возвращать false для любого другого ответа', async () => {
        const { createInterface } = await import('node:readline/promises');
        const mockQuestion = vi.fn().mockResolvedValue('maybe');
        const mockClose = vi.fn();

        vi.mocked(createInterface).mockReturnValue({
            close: mockClose,
            question: mockQuestion,
        } as never);

        const result = await askConfirmation('Test question');

        expect(result).toBe(false);
        expect(mockClose).toHaveBeenCalled();
    });

    it('должен обрабатывать ответы с пробелами', async () => {
        const { createInterface } = await import('node:readline/promises');
        const mockQuestion = vi.fn().mockResolvedValue('  y  ');
        const mockClose = vi.fn();

        vi.mocked(createInterface).mockReturnValue({
            close: mockClose,
            question: mockQuestion,
        } as never);

        const result = await askConfirmation('Test question');

        expect(result).toBe(true);
        expect(mockClose).toHaveBeenCalled();
    });

    it('должен возвращать false для пустого ответа после trim', async () => {
        const { createInterface } = await import('node:readline/promises');
        const mockQuestion = vi.fn().mockResolvedValue('   ');
        const mockClose = vi.fn();

        vi.mocked(createInterface).mockReturnValue({
            close: mockClose,
            question: mockQuestion,
        } as never);

        const result = await askConfirmation('Test question');

        expect(result).toBe(false);
        expect(mockClose).toHaveBeenCalled();
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

    it('должен закрывать интерфейс даже при ошибке', async () => {
        const { createInterface } = await import('node:readline/promises');
        const mockQuestion = vi.fn().mockRejectedValue(new Error('Test error'));
        const mockClose = vi.fn();

        vi.mocked(createInterface).mockReturnValue({
            close: mockClose,
            question: mockQuestion,
        } as never);

        await expect(askConfirmation('Test question')).rejects.toThrow('Test error');
        expect(mockClose).toHaveBeenCalled();
    });
});

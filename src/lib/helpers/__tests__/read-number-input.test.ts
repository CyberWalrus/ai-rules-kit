import { createInterface } from 'node:readline';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:readline', () => ({
    createInterface: vi.fn(),
}));

describe('readNumberInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен возвращать 0-based индекс при корректном вводе', async () => {
        const mockQuestion = vi.fn((_prompt, callback) => {
            callback('1'); // Пользователь вводит 1
        });
        const mockClose = vi.fn();
        vi.mocked(createInterface).mockReturnValue({
            close: mockClose,
            on: vi.fn() as never,
            question: mockQuestion as never,
        } as never);

        const { readNumberInput } = await import('../read-number-input');

        const result = await readNumberInput(3);

        expect(result).toBe(0); // 1 - 1 = 0
        expect(mockQuestion).toHaveBeenCalled();
        expect(mockClose).toHaveBeenCalled();
    });

    it('должен возвращать null при закрытии интерфейса', async () => {
        const mockQuestion = vi.fn();
        const mockOn = vi.fn((_event, callback) => {
            callback(); // Эмуляция закрытия интерфейса
        });
        vi.mocked(createInterface).mockReturnValue({
            close: vi.fn(),
            on: mockOn as never,
            question: mockQuestion as never,
        } as never);

        const { readNumberInput } = await import('../read-number-input');

        const result = await readNumberInput(3);

        expect(result).toBeNull();
    });

    it('должен повторно спрашивать при некорректном вводе', async () => {
        let callCount = 0;
        const mockQuestion = vi.fn((_prompt, callback) => {
            callCount++;
            // Первый вызов - некорректный ввод
            if (callCount === 1) {
                callback('invalid');
            } else {
                // Второй вызов - корректный
                callback('2');
            }
        });
        const mockClose = vi.fn();
        vi.mocked(createInterface).mockReturnValue({
            close: mockClose,
            on: vi.fn() as never,
            question: mockQuestion as never,
        } as never);

        const { readNumberInput } = await import('../read-number-input');

        const result = await readNumberInput(3);

        expect(result).toBe(1); // 2 - 1 = 1
        expect(mockQuestion).toHaveBeenCalledTimes(2);
        expect(mockClose).toHaveBeenCalled();
    });
});

import { describe, expect, it } from 'vitest';

import { calculateDiff } from '../calculate-diff';

describe('calculateDiff', () => {
    it('должен возвращать все директории в toUpdate для MVP версии', () => {
        const currentVersion = '1.0.0';
        const targetVersion = '1.1.0';

        const result = calculateDiff(currentVersion, targetVersion);

        expect(result.toUpdate).toHaveLength(4);
        expect(result.toUpdate).toEqual(['.cursor/rules', '.cursor/docs', '.cursor/commands', 'user-rules']);
        expect(result.toAdd).toEqual([]);
        expect(result.toDelete).toEqual([]);
    });

    it('должен выбрасывать ошибку если currentVersion пустой', () => {
        expect(() => calculateDiff('', '1.0.0')).toThrow('currentVersion is required');
    });

    it('должен выбрасывать ошибку если currentVersion null', () => {
        expect(() => calculateDiff(null as unknown as string, '1.0.0')).toThrow('currentVersion is required');
    });

    it('должен выбрасывать ошибку если targetVersion пустой', () => {
        expect(() => calculateDiff('1.0.0', '')).toThrow('targetVersion is required');
    });

    it('должен выбрасывать ошибку если targetVersion null', () => {
        expect(() => calculateDiff('1.0.0', null as unknown as string)).toThrow('targetVersion is required');
    });

    it('должен возвращать пустые массивы toAdd и toDelete', () => {
        const currentVersion = '0.1.0';
        const targetVersion = '0.2.0';

        const result = calculateDiff(currentVersion, targetVersion);

        expect(result.toAdd).toEqual([]);
        expect(result.toDelete).toEqual([]);
    });

    it('должен работать с разными версиями', () => {
        const result1 = calculateDiff('1.0.0', '2.0.0');
        const result2 = calculateDiff('0.1.0', '0.1.1');

        expect(result1.toUpdate).toEqual(['.cursor/rules', '.cursor/docs', '.cursor/commands', 'user-rules']);
        expect(result2.toUpdate).toEqual(['.cursor/rules', '.cursor/docs', '.cursor/commands', 'user-rules']);
    });
});

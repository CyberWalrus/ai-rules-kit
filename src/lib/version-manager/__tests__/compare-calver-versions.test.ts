import { describe, expect, it } from 'vitest';

import { compareCalVerVersions } from '../compare-calver-versions';

describe('compareCalVerVersions', () => {
    it('должен возвращать major для более нового года', () => {
        const result = compareCalVerVersions('2025.11.7.1', '2026.1.1.1');

        expect(result.changeType).toBe('major');
        expect(result.current).toBe('2025.11.7.1');
        expect(result.target).toBe('2026.1.1.1');
    });

    it('должен возвращать major для более нового месяца в том же году', () => {
        const result = compareCalVerVersions('2025.11.7.1', '2025.12.1.1');

        expect(result.changeType).toBe('major');
        expect(result.current).toBe('2025.11.7.1');
        expect(result.target).toBe('2025.12.1.1');
    });

    it('должен возвращать minor для более нового дня в том же месяце', () => {
        const result = compareCalVerVersions('2025.11.7.1', '2025.11.8.1');

        expect(result.changeType).toBe('minor');
        expect(result.current).toBe('2025.11.7.1');
        expect(result.target).toBe('2025.11.8.1');
    });

    it('должен возвращать patch для более нового инкремента в тот же день', () => {
        const result = compareCalVerVersions('2025.11.7.1', '2025.11.7.2');

        expect(result.changeType).toBe('patch');
        expect(result.current).toBe('2025.11.7.1');
        expect(result.target).toBe('2025.11.7.2');
    });

    it('должен возвращать none для одинаковых версий', () => {
        const result = compareCalVerVersions('2025.11.7.1', '2025.11.7.1');

        expect(result.changeType).toBe('none');
        expect(result.current).toBe('2025.11.7.1');
        expect(result.target).toBe('2025.11.7.1');
    });

    it('должен возвращать none для более старой версии', () => {
        const result = compareCalVerVersions('2025.11.7.2', '2025.11.7.1');

        expect(result.changeType).toBe('none');
        expect(result.current).toBe('2025.11.7.2');
        expect(result.target).toBe('2025.11.7.1');
    });

    it('должен возвращать none для более старого дня', () => {
        const result = compareCalVerVersions('2025.11.8.1', '2025.11.7.1');

        expect(result.changeType).toBe('none');
        expect(result.current).toBe('2025.11.8.1');
        expect(result.target).toBe('2025.11.7.1');
    });

    it('должен возвращать none для более старого месяца', () => {
        const result = compareCalVerVersions('2025.12.1.1', '2025.11.7.1');

        expect(result.changeType).toBe('none');
        expect(result.current).toBe('2025.12.1.1');
        expect(result.target).toBe('2025.11.7.1');
    });

    it('должен возвращать none для более старого года', () => {
        const result = compareCalVerVersions('2026.1.1.1', '2025.11.7.1');

        expect(result.changeType).toBe('none');
        expect(result.current).toBe('2026.1.1.1');
        expect(result.target).toBe('2025.11.7.1');
    });

    it('должен выбрасывать ошибку если current версия пустая', () => {
        expect(() => compareCalVerVersions('', '2025.11.7.1')).toThrow('current version is required');
    });

    it('должен выбрасывать ошибку если target версия пустая', () => {
        expect(() => compareCalVerVersions('2025.11.7.1', '')).toThrow('target version is required');
    });

    it('должен выбрасывать ошибку если current версия null', () => {
        expect(() => compareCalVerVersions(null as never, '2025.11.7.1')).toThrow('current version is required');
    });

    it('должен выбрасывать ошибку если target версия null', () => {
        expect(() => compareCalVerVersions('2025.11.7.1', null as never)).toThrow('target version is required');
    });

    it('должен выбрасывать ошибку если current версия undefined', () => {
        expect(() => compareCalVerVersions(undefined as never, '2025.11.7.1')).toThrow('current version is required');
    });

    it('должен выбрасывать ошибку если target версия undefined', () => {
        expect(() => compareCalVerVersions('2025.11.7.1', undefined as never)).toThrow('target version is required');
    });

    it('должен выбрасывать ошибку если формат версии неверный (меньше 4 частей)', () => {
        expect(() => compareCalVerVersions('2025.11.7', '2025.11.7.1')).toThrow(
            'CalVer version must be in format YYYY.M.D.N',
        );
    });

    it('должен выбрасывать ошибку если формат версии неверный (больше 4 частей)', () => {
        expect(() => compareCalVerVersions('2025.11.7.1.1', '2025.11.7.1')).toThrow(
            'CalVer version must be in format YYYY.M.D.N',
        );
    });

    it('должен выбрасывать ошибку если версия содержит нечисловые значения', () => {
        expect(() => compareCalVerVersions('2025.11.7.abc', '2025.11.7.1')).toThrow('Invalid current version format');
    });
});

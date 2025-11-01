import { describe, expect, it } from 'vitest';

import { isEmptyString } from '../is-empty-string';

describe('isEmptyString', () => {
    it('должен возвращать true для пустой строки', () => {
        expect(isEmptyString('')).toBe(true);
    });

    it('должен возвращать true для null', () => {
        expect(isEmptyString(null)).toBe(true);
    });

    it('должен возвращать true для undefined', () => {
        expect(isEmptyString(undefined)).toBe(true);
    });

    it('должен возвращать false для непустой строки', () => {
        expect(isEmptyString('hello')).toBe(false);
    });

    it('должен возвращать false для строки с пробелами', () => {
        expect(isEmptyString('  ')).toBe(false);
    });

    it('должен возвращать false для строки с нулем', () => {
        expect(isEmptyString('0')).toBe(false);
    });

    it('должен возвращать false для строки с false', () => {
        expect(isEmptyString('false')).toBe(false);
    });
});

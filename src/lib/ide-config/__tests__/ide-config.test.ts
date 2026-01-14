import { describe, expect, it } from 'vitest';

import { getIdeFileExtension, getIdeRulesDir, getProjectIdeDir } from '../index';

describe('getProjectIdeDir', () => {
    it('должен возвращать .cursor для Cursor', () => {
        expect(getProjectIdeDir('cursor')).toBe('.cursor');
    });

    it('должен возвращать .trae для TRAE', () => {
        expect(getProjectIdeDir('trae')).toBe('.trae');
    });

    it('должен возвращать .claude для Claude Code', () => {
        expect(getProjectIdeDir('claude-code')).toBe('.claude');
    });

    it('должен выбрасывать ошибку для неподдерживаемого IDE', () => {
        expect(() => getProjectIdeDir('unknown' as never)).toThrow('Unsupported IDE type');
    });
});

describe('getIdeFileExtension', () => {
    it('должен возвращать .mdc для Cursor', () => {
        expect(getIdeFileExtension('cursor')).toBe('.mdc');
    });

    it('должен возвращать .md для TRAE', () => {
        expect(getIdeFileExtension('trae')).toBe('.md');
    });

    it('должен возвращать .md для Claude Code', () => {
        expect(getIdeFileExtension('claude-code')).toBe('.md');
    });

    it('должен выбрасывать ошибку для неподдерживаемого IDE', () => {
        expect(() => getIdeFileExtension('unknown' as never)).toThrow('Unsupported IDE type');
    });
});

describe('getIdeRulesDir', () => {
    it('должен возвращать rules-kit для Cursor', () => {
        expect(getIdeRulesDir('cursor')).toBe('rules-kit');
    });

    it('должен возвращать rules-kit для TRAE', () => {
        expect(getIdeRulesDir('trae')).toBe('rules-kit');
    });

    it('должен возвращать rules-kit для Claude Code', () => {
        expect(getIdeRulesDir('claude-code')).toBe('rules-kit');
    });
});

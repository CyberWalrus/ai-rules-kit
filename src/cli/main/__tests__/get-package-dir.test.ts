import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { getPackageDir } from '../get-package-dir';

describe('getPackageDir', () => {
    it('должен возвращать путь на 1 уровень вверх для production окружения (dist/cli.js)', () => {
        const productionPath = '/Users/test/project/node_modules/cursor-rules-cli/dist/cli.js';
        const expectedPath = join('/Users/test/project/node_modules/cursor-rules-cli/dist', '..');

        const result = getPackageDir(productionPath);

        expect(result).toBe(expectedPath);
    });

    it('должен возвращать путь на 3 уровня вверх для development окружения (src/cli/main/index.ts)', () => {
        const developmentPath = '/Users/test/project/src/cli/main/index.ts';
        const expectedPath = join('/Users/test/project/src/cli/main', '..', '..', '..');

        const result = getPackageDir(developmentPath);

        expect(result).toBe(expectedPath);
    });

    it('должен корректно обрабатывать путь с /dist/ в середине', () => {
        const pathWithDist = '/Users/test/project/dist/cli.js';
        const expectedPath = join('/Users/test/project/dist', '..');

        const result = getPackageDir(pathWithDist);

        expect(result).toBe(expectedPath);
    });

    it('должен корректно обрабатывать путь без /dist/', () => {
        const pathWithoutDist = '/Users/test/project/src/index.ts';
        const expectedPath = join('/Users/test/project/src', '..', '..', '..');

        const result = getPackageDir(pathWithoutDist);

        expect(result).toBe(expectedPath);
    });

    it('должен выбрасывать ошибку при пустом пути', () => {
        expect(() => getPackageDir('')).toThrow('currentFilePath is required');
    });

    it('должен работать с относительными путями для development', () => {
        const relativePath = './src/cli/main/index.ts';
        const expectedPath = join('./src/cli/main', '..', '..', '..');

        const result = getPackageDir(relativePath);

        expect(result).toBe(expectedPath);
    });
});

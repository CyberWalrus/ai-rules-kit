import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isEmptyString } from '../helpers';

/** Получает версию из package.json пакета */
export async function getPackageVersion(packageDir: string): Promise<string> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }

    const packageJsonPath = join(packageDir, 'package.json');

    try {
        const content = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content) as { version: string };

        return packageJson.version;
    } catch (error) {
        throw new Error(`Failed to read package version: ${String(error)}`);
    }
}

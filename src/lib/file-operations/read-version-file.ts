import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { VersionInfo } from '../../model';
import { VERSION_FILE_NAME } from '../../model';
import { isEmptyString } from '../helpers';
import { pathExists } from './path-exists';

/** Читает файл версии из целевой директории */
export async function readVersionFile(targetDir: string): Promise<VersionInfo | null> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const versionFilePath = join(targetDir, '.cursor', VERSION_FILE_NAME);
    const fileExists = await pathExists(versionFilePath);

    if (fileExists === false) {
        return null;
    }

    try {
        const content = await readFile(versionFilePath, 'utf-8');

        return JSON.parse(content) as VersionInfo;
    } catch {
        return null;
    }
}

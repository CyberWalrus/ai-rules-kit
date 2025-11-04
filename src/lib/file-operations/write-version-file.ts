import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { VersionInfo } from '../../model';
import { VERSION_FILE_NAME } from '../../model';
import { isEmptyString } from '../helpers';

/** Записывает файл версии в целевую директорию */
export async function writeVersionFile(targetDir: string, versionInfo: VersionInfo): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }
    if (versionInfo === null || versionInfo === undefined) {
        throw new Error('versionInfo is required');
    }

    const cursorDir = join(targetDir, '.cursor');
    const versionFilePath = join(cursorDir, VERSION_FILE_NAME);
    const content = JSON.stringify(versionInfo, null, 2);

    try {
        await mkdir(cursorDir, { recursive: true });
        await writeFile(versionFilePath, content, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to write version file: ${String(error)}`);
    }
}

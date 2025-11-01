import { writeFile } from 'node:fs/promises';
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

    const versionFilePath = join(targetDir, VERSION_FILE_NAME);
    const content = JSON.stringify(versionInfo, null, 2);

    try {
        await writeFile(versionFilePath, content, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to write version file: ${String(error)}`);
    }
}

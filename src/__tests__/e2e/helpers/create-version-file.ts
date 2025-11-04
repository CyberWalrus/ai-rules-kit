import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isEmptyString } from '../../../lib/helpers';
import type { VersionInfo } from '../../../model/types/main';

/** Создает файл .cursor/rules-version.json */
export async function createVersionFile(targetDir: string, version: string): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }
    if (isEmptyString(version)) {
        throw new Error('version is required');
    }

    const versionInfo: VersionInfo = {
        installedAt: new Date().toISOString(),
        source: 'cursor-rules',
        version,
    };

    const cursorDir = join(targetDir, '.cursor');
    const versionFilePath = join(cursorDir, 'rules-version.json');
    try {
        await mkdir(cursorDir, { recursive: true });
        await writeFile(versionFilePath, JSON.stringify(versionInfo, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`Failed to write version file: ${String(error)}`);
    }
}

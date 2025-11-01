import { cp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { VersionInfo } from '../../../model/types/main';

/** Копирует .cursor правила из корня проекта во временную директорию */
export async function copyRulesFixtures(targetDir: string): Promise<void> {
    if (!targetDir) {
        throw new Error('targetDir is required');
    }

    const projectRoot = join(process.cwd());
    const cursorSourceDir = join(projectRoot, '.cursor');
    const cursorTargetDir = join(targetDir, '.cursor');

    await cp(cursorSourceDir, cursorTargetDir, { recursive: true });

    const userRulesSourceDir = join(projectRoot, 'user-rules');
    const userRulesTargetDir = join(targetDir, 'user-rules');

    await cp(userRulesSourceDir, userRulesTargetDir, { recursive: true });
}

/** Создает файл .cursor-rules-version.json */
export async function createVersionFile(targetDir: string, version: string): Promise<void> {
    if (!targetDir) {
        throw new Error('targetDir is required');
    }
    if (!version) {
        throw new Error('version is required');
    }

    const versionInfo: VersionInfo = {
        installedAt: new Date().toISOString(),
        source: 'cursor-rules',
        version,
    };

    const versionFilePath = join(targetDir, '.cursor-rules-version.json');
    await writeFile(versionFilePath, JSON.stringify(versionInfo, null, 2), 'utf-8');
}

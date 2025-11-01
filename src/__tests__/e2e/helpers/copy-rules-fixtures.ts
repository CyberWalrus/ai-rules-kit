import { cp } from 'node:fs/promises';
import { join } from 'node:path';

import { pathExists } from '../../../lib/file-operations/path-exists';
import { isEmptyString } from '../../../lib/helpers';

/** Копирует .cursor правила из корня проекта во временную директорию */
export async function copyRulesFixtures(targetDir: string): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const projectRoot = join(process.cwd());
    const cursorSourceDir = join(projectRoot, '.cursor');
    const cursorTargetDir = join(targetDir, '.cursor');

    const cursorExists = await pathExists(cursorSourceDir);
    if (cursorExists) {
        await cp(cursorSourceDir, cursorTargetDir, { recursive: true });
    }

    const userRulesSourceDir = join(projectRoot, 'user-rules');
    const userRulesTargetDir = join(targetDir, 'user-rules');

    const userRulesExists = await pathExists(userRulesSourceDir);
    if (userRulesExists) {
        await cp(userRulesSourceDir, userRulesTargetDir, { recursive: true });
    }
}

import { cp } from 'node:fs/promises';
import { join } from 'node:path';

import { isEmptyString } from '../../../lib/helpers';

/** Копирует правила из корня проекта во временную директорию */
export async function copyRulesFixtures(targetDir: string): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const projectRoot = join(process.cwd());
    const sourceDir = join(projectRoot, 'rules-kit');
    const targetRulesKitDir = join(targetDir, 'rules-kit');

    await cp(sourceDir, targetRulesKitDir, { force: true, recursive: true });
}

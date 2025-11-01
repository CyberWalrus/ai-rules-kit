import { cp } from 'node:fs/promises';
import { join } from 'node:path';

import { RULES_DIRS } from '../../model';
import { isEmptyString } from '../helpers';
import { pathExists } from './path-exists';

/** Копирует правила из пакета в целевую директорию */
export async function copyRulesToTarget(packageDir: string, targetDir: string): Promise<void> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    await Promise.all(
        RULES_DIRS.map(async (ruleDir) => {
            const sourcePath = join(packageDir, ruleDir);
            const targetPath = join(targetDir, ruleDir);
            const sourceExists = await pathExists(sourcePath);

            if (!sourceExists) {
                return;
            }

            await cp(sourcePath, targetPath, {
                force: true,
                recursive: true,
            });
        }),
    );
}

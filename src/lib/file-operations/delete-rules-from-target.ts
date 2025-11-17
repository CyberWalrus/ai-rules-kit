import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { RULES_DIRS } from '../../model';
import { isEmptyString } from '../helpers';
import { pathExists } from './path-exists';

/** Удаляет правила из целевой директории */
export async function deleteRulesFromTarget(targetDir: string): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    for (const ruleDir of RULES_DIRS) {
        const targetPath = join(targetDir, ruleDir);
        const targetExists = await pathExists(targetPath);

        if (!targetExists) {
            continue;
        }

        await rm(targetPath, {
            force: true,
            recursive: true,
        });
    }
}

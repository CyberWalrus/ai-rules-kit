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

    await Promise.all(
        RULES_DIRS.map(async (ruleDir) => {
            const targetRuleDir = ruleDir.replace(/^cursor\//, '.cursor/');
            const targetPath = join(targetDir, targetRuleDir);
            const targetExists = await pathExists(targetPath);

            if (!targetExists) {
                return;
            }

            await rm(targetPath, {
                force: true,
                recursive: true,
            });
        }),
    );
}

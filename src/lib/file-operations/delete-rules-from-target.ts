import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { RULES_DIRS } from '../../model';
import { isEmptyString } from '../helpers';
import type { IdeType } from '../ide-config';
import { getProjectIdeDir } from '../ide-config';
import { pathExists } from './path-exists';

/** Удаляет правила из целевой директории */
export async function deleteRulesFromTarget(targetDir: string, ideType: IdeType): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const ideDir = getProjectIdeDir(ideType);

    await Promise.all(
        RULES_DIRS.map(async (ruleDir) => {
            const targetRuleDir = `${ideDir + ruleDir.replace(/^rules-kit\//, '')}/`;
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

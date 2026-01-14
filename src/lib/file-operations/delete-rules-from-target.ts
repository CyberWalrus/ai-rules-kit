import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { CLAUDE_MAIN_FILE_NAME, RULES_DIRS } from '../../model';
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

    // Для Claude Code удаляем также CLAUDE.md в корне проекта
    if (ideType === 'claude-code') {
        const claudeMdPath = join(targetDir, CLAUDE_MAIN_FILE_NAME);
        const claudeMdExists = await pathExists(claudeMdPath);

        if (claudeMdExists) {
            await rm(claudeMdPath, { force: true });
        }
    }
}

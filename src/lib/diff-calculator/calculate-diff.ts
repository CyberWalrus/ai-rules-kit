import { join } from 'node:path';

import type { VersionDiff } from '../../model';
import { RULES_DIRS } from '../../model';
import { isEmptyString } from '../helpers';
import { scanDirectory } from './scan-directory';

/** Вычисляет diff между версиями правил */
export async function calculateDiff(packageDir: string, targetDir: string): Promise<VersionDiff> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const toAdd: string[] = [];
    const toDelete: string[] = [];
    const toUpdate: string[] = [];

    await Promise.all(
        RULES_DIRS.map(async (ruleDir) => {
            const sourcePath = join(packageDir, ruleDir);
            const targetPath = join(targetDir, ruleDir);

            try {
                const sourceMap = await scanDirectory(sourcePath);
                const targetMap = await scanDirectory(targetPath);

                sourceMap.forEach((sourceHash, relativePath) => {
                    const targetHash = targetMap.get(relativePath);

                    if (targetHash === undefined) {
                        toAdd.push(join(ruleDir, relativePath).replace(/\\/g, '/'));
                    } else if (sourceHash !== targetHash) {
                        toUpdate.push(join(ruleDir, relativePath).replace(/\\/g, '/'));
                    }
                });

                targetMap.forEach((_, relativePath) => {
                    if (!sourceMap.has(relativePath)) {
                        toDelete.push(join(ruleDir, relativePath).replace(/\\/g, '/'));
                    }
                });
            } catch (error: unknown) {
                console.error(`Failed to scan directory ${ruleDir}:`, error);
            }
        }),
    );

    return {
        toAdd,
        toDelete,
        toUpdate,
    };
}

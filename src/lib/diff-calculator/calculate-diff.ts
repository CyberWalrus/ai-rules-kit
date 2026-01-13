import { join } from 'node:path';

import type { VersionDiff } from '../../model';
import { RULES_DIRS } from '../../model';
import { isEmptyString } from '../helpers';
import { scanDirectory } from './scan-directory';

/** Вычисляет diff между версиями правил */
export async function calculateDiff(
    packageDir: string,
    targetDir: string,
    sourceDirPrefix: string = '',
): Promise<VersionDiff> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const results = await Promise.all(
        RULES_DIRS.map(async (ruleDir) => {
            const sourcePath = join(packageDir, sourceDirPrefix, ruleDir);
            const targetRuleDir = `.cursor/${ruleDir}`;
            const targetPath = join(targetDir, targetRuleDir);

            const adds: string[] = [];
            const deletes: string[] = [];
            const updates: string[] = [];

            try {
                const sourceMap = await scanDirectory(sourcePath);
                const targetMap = await scanDirectory(targetPath);

                sourceMap.forEach((sourceHash, relativePath) => {
                    const targetHash = targetMap.get(relativePath);

                    if (targetHash === undefined) {
                        adds.push(join(targetRuleDir, relativePath).replace(/\\/g, '/'));
                    } else if (sourceHash !== targetHash) {
                        updates.push(join(targetRuleDir, relativePath).replace(/\\/g, '/'));
                    }
                });

                targetMap.forEach((_, relativePath) => {
                    if (!sourceMap.has(relativePath)) {
                        deletes.push(join(targetRuleDir, relativePath).replace(/\\/g, '/'));
                    }
                });
            } catch (error: unknown) {
                console.error(`Failed to scan directory ${ruleDir}:`, error);
            }

            return {
                adds,
                deletes,
                updates,
            };
        }),
    );

    return {
        toAdd: results.flatMap((r) => r.adds),
        toDelete: results.flatMap((r) => r.deletes),
        toUpdate: results.flatMap((r) => r.updates),
    };
}

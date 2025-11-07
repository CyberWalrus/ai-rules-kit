import {
    copyRulesToTarget,
    deleteRulesFromTarget,
    readConfigFile,
    writeConfigFile,
} from '../../../lib/file-operations';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import type { RulesConfig } from '../../../model';
import { replaceAllCommandParamsSchema } from '../../../model';

/** Команда полной замены правил */
export async function replaceAllCommand(packageDir: string, targetDir: string): Promise<void> {
    try {
        replaceAllCommandParamsSchema.parse({ packageDir, targetDir });
    } catch (error) {
        const zodError = error as { issues?: Array<{ path: Array<number | string> }> };
        const firstIssue = zodError.issues?.[0];
        if (firstIssue) {
            const firstPath = firstIssue.path[0];
            if (firstPath === 'packageDir') {
                throw new Error('packageDir is required');
            }
            if (firstPath === 'targetDir') {
                throw new Error('targetDir is required');
            }
        }
        throw error;
    }

    const existingConfig = await readConfigFile(targetDir);
    const version = await getPackageVersion(packageDir);
    const currentTimestamp = new Date().toISOString();

    let config: RulesConfig;

    if (existingConfig !== null) {
        config = {
            ...existingConfig,
            updatedAt: currentTimestamp,
            version,
        };
    } else {
        config = {
            configVersion: '1.0.0',
            fileOverrides: [],
            ignoreList: [],
            installedAt: currentTimestamp,
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: currentTimestamp,
            version,
        };
    }

    await deleteRulesFromTarget(targetDir);

    await copyRulesToTarget(packageDir, targetDir, config.ignoreList ?? [], config.fileOverrides ?? []);

    await writeConfigFile(targetDir, config);
}

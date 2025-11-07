import { copyRulesToTarget } from '../../../lib/file-operations/copy-rules-to-target';
import { writeConfigFile } from '../../../lib/file-operations/write-config-file';
import { getCurrentVersion } from '../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import type { RulesConfig } from '../../../model';
import { initCommandParamsSchema } from '../../../model';

/** Команда инициализации правил */
export async function initCommand(packageDir: string, targetDir: string): Promise<void> {
    try {
        initCommandParamsSchema.parse({ packageDir, targetDir });
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

    const existingVersion = await getCurrentVersion(targetDir);
    if (existingVersion !== null) {
        throw new Error(`Rules already initialized with version ${existingVersion}`);
    }

    await copyRulesToTarget(packageDir, targetDir);

    const version = await getPackageVersion(packageDir);
    const currentTimestamp = new Date().toISOString();
    const config: RulesConfig = {
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
    await writeConfigFile(targetDir, config);
}

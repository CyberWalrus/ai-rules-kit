import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
    copyRulesToTarget,
    deleteRulesFromTarget,
    readConfigFile,
    writeConfigFile,
} from '../../../lib/file-operations';
import { fetchPromptsTarball, getLatestPromptsVersion } from '../../../lib/github-fetcher';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import type { RulesConfig } from '../../../model';
import { GITHUB_REPO, replaceAllCommandParamsSchema } from '../../../model';

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
    const cliVersion = await getPackageVersion(packageDir);
    const promptsVersion = await getLatestPromptsVersion(GITHUB_REPO);
    const currentTimestamp = new Date().toISOString();

    let config: RulesConfig;

    if (existingConfig !== null) {
        config = {
            ...existingConfig,
            cliVersion,
            promptsVersion,
            updatedAt: currentTimestamp,
        };
    } else {
        config = {
            cliVersion,
            configVersion: '1.0.0',
            fileOverrides: [],
            ignoreList: [],
            installedAt: currentTimestamp,
            promptsVersion,
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
        };
    }

    const tmpDir = join(tmpdir(), `cursor-rules-${Date.now()}`);

    try {
        await fetchPromptsTarball(GITHUB_REPO, promptsVersion, tmpDir);
        await deleteRulesFromTarget(targetDir);
        await copyRulesToTarget(tmpDir, targetDir, config.ignoreList ?? [], config.fileOverrides ?? []);
        await writeConfigFile(targetDir, config);
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

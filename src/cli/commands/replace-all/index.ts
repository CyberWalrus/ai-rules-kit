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
import { askConfirmation } from '../../../lib/helpers';
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
    let promptsVersion = await getLatestPromptsVersion(GITHUB_REPO);

    if (promptsVersion == null) {
        if (existingConfig !== null && existingConfig.promptsVersion !== undefined) {
            console.warn(
                `⚠️ No internet connection. Cannot fetch latest version from GitHub. Using current local version: ${existingConfig.promptsVersion}`,
            );

            const shouldUseLocal = await askConfirmation('Do you want to continue with the current local version?');

            if (!shouldUseLocal) {
                throw new Error('Replace-all cancelled by user');
            }

            promptsVersion = existingConfig.promptsVersion;
        } else {
            throw new Error(
                'Failed to fetch latest prompts version from GitHub. No internet connection and no existing config found.',
            );
        }
    }

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

        console.log(`✓ Replaced prompts to version ${promptsVersion}`);
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

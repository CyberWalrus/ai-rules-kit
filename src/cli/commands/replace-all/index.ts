import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
    copyRulesToTarget,
    deleteRulesFromTarget,
    readConfigFile,
    writeConfigFile,
} from '../../../lib/file-operations';
import { fetchPromptsTarball, fetchSystemRulesTarball } from '../../../lib/github-fetcher';
import { askConfirmation } from '../../../lib/helpers';
import { t } from '../../../lib/i18n';
import { readUserConfig } from '../../../lib/user-config';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { getVersionsWithRetry } from '../../../lib/version-manager/get-versions-with-retry';
import type { RulesConfig } from '../../../model';
import { GITHUB_REPO, replaceAllCommandParamsSchema } from '../../../model';

/** Команда полной замены правил */
// eslint-disable-next-line sonarjs/cognitive-complexity
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
    const { promptsVersion: fetchedPromptsVersion, systemRulesVersion: fetchedSystemRulesVersion } =
        await getVersionsWithRetry();
    let promptsVersion = fetchedPromptsVersion;

    if (promptsVersion == null) {
        if (existingConfig !== null && existingConfig.promptsVersion !== undefined) {
            console.warn(t('command.replace-all.no-internet', { version: existingConfig.promptsVersion }));

            const shouldUseLocal = await askConfirmation(t('command.replace-all.use-local'));

            if (!shouldUseLocal) {
                throw new Error(t('command.replace-all.use-local.no'));
            }

            promptsVersion = existingConfig.promptsVersion;
        } else {
            throw new Error(t('command.replace-all.fetch-failed'));
        }
    }

    const currentTimestamp = new Date().toISOString();

    const userConfig = await readUserConfig();
    let config: RulesConfig;

    let systemRulesVersion: string | undefined = fetchedSystemRulesVersion ?? undefined;
    if (systemRulesVersion === undefined && existingConfig?.systemRulesVersion !== undefined) {
        systemRulesVersion = existingConfig.systemRulesVersion;
    }

    if (existingConfig !== null) {
        config = {
            ...existingConfig,
            cliVersion,
            promptsVersion,
            systemRulesVersion,
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
                language: userConfig?.language ?? 'en',
            },
            source: 'cursor-rules',
            systemRulesVersion,
            updatedAt: currentTimestamp,
        };
    }

    const tmpDir = join(tmpdir(), `cursor-rules-${Date.now()}`);

    try {
        await Promise.all([
            fetchPromptsTarball(GITHUB_REPO, promptsVersion, tmpDir),
            systemRulesVersion !== undefined
                ? fetchSystemRulesTarball(GITHUB_REPO, systemRulesVersion, tmpDir)
                : Promise.resolve(),
        ]);
        await deleteRulesFromTarget(targetDir);
        await copyRulesToTarget(tmpDir, targetDir, config.ignoreList ?? [], config.fileOverrides ?? []);
        await writeConfigFile(targetDir, config);

        console.log(t('command.replace-all.success', { version: promptsVersion }));
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

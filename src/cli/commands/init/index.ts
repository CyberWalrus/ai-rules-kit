import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { copyRulesToTarget } from '../../../lib/file-operations/copy-rules-to-target';
import { writeConfigFile } from '../../../lib/file-operations/write-config-file';
import { fetchPromptsTarball, fetchSystemRulesTarball } from '../../../lib/github-fetcher';
import { t } from '../../../lib/i18n';
import { readUserConfig } from '../../../lib/user-config';
import { getCurrentVersion } from '../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { getVersionsWithRetry } from '../../../lib/version-manager/get-versions-with-retry';
import type { RulesConfig } from '../../../model';
import { GITHUB_REPO, initCommandParamsSchema } from '../../../model';

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
        throw new Error(t('command.init.already-initialized', { version: existingVersion }));
    }

    const { promptsVersion, systemRulesVersion } = await getVersionsWithRetry();
    if (promptsVersion === null) {
        throw new Error(t('command.init.fetch-failed'));
    }

    const tmpDir = join(tmpdir(), `cursor-rules-${Date.now()}`);

    try {
        await Promise.all([
            fetchPromptsTarball(GITHUB_REPO, promptsVersion, tmpDir),
            systemRulesVersion !== null
                ? fetchSystemRulesTarball(GITHUB_REPO, systemRulesVersion, tmpDir)
                : Promise.resolve(),
        ]);
        await copyRulesToTarget(tmpDir, targetDir);

        const cliVersion = await getPackageVersion(packageDir);
        const currentTimestamp = new Date().toISOString();
        const userConfig = await readUserConfig();
        const config: RulesConfig = {
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
            systemRulesVersion: systemRulesVersion ?? undefined,
            updatedAt: currentTimestamp,
        };
        await writeConfigFile(targetDir, config);

        console.log(t('command.init.success', { version: promptsVersion }));
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

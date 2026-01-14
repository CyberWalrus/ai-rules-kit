import { select } from '@clack/prompts';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { copyRulesToTarget } from '../../../lib/file-operations/copy-rules-to-target';
import { writeConfigFile } from '../../../lib/file-operations/write-config-file';
import { fetchPromptsTarball, fetchSystemRulesTarball } from '../../../lib/github-fetcher';
import { t } from '../../../lib/i18n';
import type { IdeType } from '../../../lib/ide-config';
import { getIdeRulesDir } from '../../../lib/ide-config';
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

    const currentUserConfig = await readUserConfig();
    const savedIdeType = currentUserConfig?.ideType ?? 'cursor';

    const selectedIdeType = await select<IdeType>({
        initialValue: savedIdeType,
        message: 'Выберите IDE',
        options: [
            { label: 'Cursor', value: 'cursor' },
            { label: 'TRAE', value: 'trae' },
            { label: 'Claude Code', value: 'claude-code' },
        ],
    });

    if (typeof selectedIdeType === 'symbol') {
        return;
    }

    const ideType = selectedIdeType;

    const { promptsVersion, systemRulesVersion } = await getVersionsWithRetry();
    if (promptsVersion === null) {
        throw new Error(t('command.init.fetch-failed'));
    }

    const tmpDir = join(tmpdir(), `ai-rules-kit-${Date.now()}`);

    try {
        await Promise.all([
            fetchPromptsTarball(GITHUB_REPO, promptsVersion, tmpDir),
            systemRulesVersion !== null
                ? fetchSystemRulesTarball(GITHUB_REPO, systemRulesVersion, tmpDir)
                : Promise.resolve(),
        ]);
        await copyRulesToTarget(tmpDir, targetDir, ideType, [], [], getIdeRulesDir(ideType));

        const cliVersion = await getPackageVersion(packageDir);
        const currentTimestamp = new Date().toISOString();
        const config: RulesConfig = {
            cliVersion,
            configVersion: '1.0.0',
            fileOverrides: [],
            ideType,
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
                language: currentUserConfig?.language ?? 'en',
            },
            source: 'ai-rules-kit',
            systemRulesVersion: systemRulesVersion ?? undefined,
            updatedAt: currentTimestamp,
        };
        await writeConfigFile(targetDir, config, ideType);

        console.log(t('command.init.success', { version: promptsVersion }));
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

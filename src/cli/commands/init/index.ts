import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { copyRulesToTarget } from '../../../lib/file-operations/copy-rules-to-target';
import { writeConfigFile } from '../../../lib/file-operations/write-config-file';
import { fetchPromptsTarball, getLatestPromptsVersion } from '../../../lib/github-fetcher';
import { getCurrentVersion } from '../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
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
        throw new Error(`Rules already initialized with version ${existingVersion}`);
    }

    const promptsVersion = await getLatestPromptsVersion(GITHUB_REPO);
    if (promptsVersion === null) {
        throw new Error(
            'Failed to fetch latest prompts version from GitHub. No internet connection or GitHub API unavailable.',
        );
    }

    const tmpDir = join(tmpdir(), `cursor-rules-${Date.now()}`);

    try {
        await fetchPromptsTarball(GITHUB_REPO, promptsVersion, tmpDir);
        await copyRulesToTarget(tmpDir, targetDir);

        const cliVersion = await getPackageVersion(packageDir);
        const currentTimestamp = new Date().toISOString();
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
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: currentTimestamp,
        };
        await writeConfigFile(targetDir, config);

        console.log(`✓ Initialized prompts version ${promptsVersion}`);
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

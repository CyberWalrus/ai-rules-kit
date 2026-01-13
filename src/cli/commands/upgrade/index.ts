import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { calculateDiff } from '../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget, readConfigFile, writeConfigFile } from '../../../lib/file-operations';
import { fetchPromptsTarball, fetchSystemRulesTarball } from '../../../lib/github-fetcher';
import { askConfirmation } from '../../../lib/helpers';
import { t } from '../../../lib/i18n';
import { compareCalVerVersions } from '../../../lib/version-manager/compare-calver-versions';
import { getCurrentVersion } from '../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { getVersionsWithRetry } from '../../../lib/version-manager/get-versions-with-retry';
import { GITHUB_REPO, upgradeCommandParamsSchema } from '../../../model';

/** Обновляет правила до последней версии */
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function upgradeCommand(packageDir: string, targetDir: string): Promise<void> {
    try {
        upgradeCommandParamsSchema.parse({ packageDir, targetDir });
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

    const currentVersion = await getCurrentVersion(targetDir);
    if (currentVersion === null) {
        throw new Error(t('command.upgrade.not-initialized'));
    }

    const config = await readConfigFile(targetDir);
    if (config === null) {
        throw new Error(t('command.upgrade.config-not-found'));
    }

    const ideType = config.ideType ?? 'cursor';

    const ruleSetsToUpdate = config.ruleSets.filter((ruleSet) => ruleSet.update);

    if (ruleSetsToUpdate.length === 0) {
        return;
    }

    const knownRuleSetIds = ['base'];
    const unknownRuleSets = ruleSetsToUpdate.filter((ruleSet) => !knownRuleSetIds.includes(ruleSet.id));

    if (unknownRuleSets.length > 0) {
        console.warn(t('command.upgrade.unknown-rule-sets', { ids: unknownRuleSets.map((rs) => rs.id).join(', ') }));
    }

    const currentPromptsVersion = config.promptsVersion ?? config.version;

    if (currentPromptsVersion == null) {
        throw new Error('Current prompts version not found in config');
    }

    const { promptsVersion: latestPromptsVersion, systemRulesVersion: latestSystemRulesVersion } =
        await getVersionsWithRetry();

    if (latestPromptsVersion == null) {
        console.warn(t('command.upgrade.no-internet', { version: currentPromptsVersion }));

        const shouldUseLocal = await askConfirmation(t('command.upgrade.use-local'));

        if (!shouldUseLocal) {
            throw new Error(t('command.upgrade.use-local.no'));
        }

        console.log(t('command.upgrade.use-local.yes', { version: currentPromptsVersion }));

        return;
    }

    if (currentPromptsVersion === latestPromptsVersion) {
        console.log(t('command.upgrade.up-to-date'));

        return;
    }

    const versionComparison = compareCalVerVersions(currentPromptsVersion, latestPromptsVersion);
    const reverseComparison = compareCalVerVersions(latestPromptsVersion, currentPromptsVersion);

    if (versionComparison.changeType === 'none' && reverseComparison.changeType !== 'none') {
        console.warn(
            t('command.upgrade.local-newer', { current: currentPromptsVersion, latest: latestPromptsVersion }),
        );

        const shouldDowngrade = await askConfirmation(
            t('command.upgrade.downgrade', { current: currentPromptsVersion, latest: latestPromptsVersion }),
        );

        if (!shouldDowngrade) {
            throw new Error(t('command.upgrade.use-local.no'));
        }
    }

    const currentSystemRulesVersion = config.systemRulesVersion;
    const shouldUpdateSystemRules =
        latestSystemRulesVersion !== null &&
        (currentSystemRulesVersion === undefined || currentSystemRulesVersion !== latestSystemRulesVersion);

    const tmpDir = join(tmpdir(), `cursor-rules-${Date.now()}`);

    try {
        await Promise.all([
            fetchPromptsTarball(GITHUB_REPO, latestPromptsVersion, tmpDir),
            shouldUpdateSystemRules
                ? fetchSystemRulesTarball(GITHUB_REPO, latestSystemRulesVersion, tmpDir)
                : Promise.resolve(),
        ]);
        await calculateDiff(tmpDir, targetDir);
        await copyRulesToTarget(tmpDir, targetDir, ideType, config.ignoreList ?? [], config.fileOverrides ?? []);

        const cliVersion = await getPackageVersion(packageDir);
        config.cliVersion = cliVersion;
        config.promptsVersion = latestPromptsVersion;
        if (shouldUpdateSystemRules) {
            config.systemRulesVersion = latestSystemRulesVersion;
        }
        config.updatedAt = new Date().toISOString();
        await writeConfigFile(targetDir, config, ideType);

        console.log(t('command.upgrade.success', { current: currentPromptsVersion, latest: latestPromptsVersion }));
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

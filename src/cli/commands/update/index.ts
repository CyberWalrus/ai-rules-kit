import { calculateDiff } from '../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget, readConfigFile, writeConfigFile } from '../../../lib/file-operations';
import { compareVersions } from '../../../lib/version-manager/compare-versions';
import { getCurrentVersion } from '../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { updateCommandParamsSchema } from '../../../model';

/** Команда обновления правил */
export async function updateCommand(packageDir: string, targetDir: string): Promise<void> {
    try {
        updateCommandParamsSchema.parse({ packageDir, targetDir });
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
        throw new Error('Rules not initialized. Run init command first.');
    }

    const packageVersion = await getPackageVersion(packageDir);

    const comparison = compareVersions(currentVersion, packageVersion);
    if (comparison.changeType === 'none') {
        return;
    }

    const config = await readConfigFile(targetDir);
    if (config === null) {
        throw new Error('Config file not found');
    }

    const ruleSetsToUpdate = config.ruleSets.filter((ruleSet) => ruleSet.update);

    if (ruleSetsToUpdate.length === 0) {
        return;
    }

    const knownRuleSetIds = ['base'];
    const unknownRuleSets = ruleSetsToUpdate.filter((ruleSet) => !knownRuleSetIds.includes(ruleSet.id));

    if (unknownRuleSets.length > 0) {
        console.warn(
            `Warning: Unknown rule set IDs found: ${unknownRuleSets.map((rs) => rs.id).join(', ')}. Proceeding anyway.`,
        );
    }

    await calculateDiff(packageDir, targetDir);

    await copyRulesToTarget(packageDir, targetDir, config.ignoreList ?? [], config.fileOverrides ?? []);

    config.version = packageVersion;
    config.updatedAt = new Date().toISOString();
    await writeConfigFile(targetDir, config);
}

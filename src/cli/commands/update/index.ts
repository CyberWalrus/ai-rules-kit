import { calculateDiff } from '../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget } from '../../../lib/file-operations/copy-rules-to-target';
import { writeVersionFile } from '../../../lib/file-operations/write-version-file';
import { compareVersions } from '../../../lib/version-manager/compare-versions';
import { getCurrentVersion } from '../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import type { VersionInfo } from '../../../model';
import { updateCommandParamsSchema } from '../../../model';

/** Команда обновления правил */
export async function updateCommand(packageDir: string, targetDir: string): Promise<void> {
    // Валидация параметров через Zod
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

    // Получаем версии
    const currentVersion = await getCurrentVersion(targetDir);
    if (currentVersion === null) {
        throw new Error('Rules not initialized. Run init command first.');
    }

    const packageVersion = await getPackageVersion(packageDir);

    // Сравниваем версии
    const comparison = compareVersions(currentVersion, packageVersion);
    if (comparison.changeType === 'none') {
        return;
    }

    // Вычисляем diff между директориями
    await calculateDiff(packageDir, targetDir);

    // Копируем обновленные правила
    await copyRulesToTarget(packageDir, targetDir);

    // Обновляем версию
    const versionInfo: VersionInfo = {
        installedAt: new Date().toISOString(),
        source: 'cursor-rules',
        version: packageVersion,
    };
    await writeVersionFile(targetDir, versionInfo);
}

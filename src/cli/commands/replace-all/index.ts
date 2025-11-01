import { copyRulesToTarget } from '../../../lib/file-operations/copy-rules-to-target';
import { deleteRulesFromTarget } from '../../../lib/file-operations/delete-rules-from-target';
import { writeVersionFile } from '../../../lib/file-operations/write-version-file';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import type { VersionInfo } from '../../../model';
import { replaceAllCommandParamsSchema } from '../../../model';

/** Команда полной замены правил */
export async function replaceAllCommand(packageDir: string, targetDir: string): Promise<void> {
    // Валидация параметров через Zod
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

    // Удаляем старые правила
    await deleteRulesFromTarget(targetDir);

    // Копируем новые правила
    await copyRulesToTarget(packageDir, targetDir);

    // Записываем версию
    const version = await getPackageVersion(packageDir);
    const versionInfo: VersionInfo = {
        installedAt: new Date().toISOString(),
        source: 'cursor-rules',
        version,
    };
    await writeVersionFile(targetDir, versionInfo);
}

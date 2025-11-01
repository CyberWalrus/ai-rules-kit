import { copyRulesToTarget } from '../../../lib/file-operations/copy-rules-to-target';
import { writeVersionFile } from '../../../lib/file-operations/write-version-file';
import { getCurrentVersion } from '../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import type { VersionInfo } from '../../../model';
import { initCommandParamsSchema } from '../../../model';

/** Команда инициализации правил */
export async function initCommand(packageDir: string, targetDir: string): Promise<void> {
    // Валидация параметров через Zod
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

    // Проверяем наличие существующих правил
    const existingVersion = await getCurrentVersion(targetDir);
    if (existingVersion !== null) {
        throw new Error(`Rules already initialized with version ${existingVersion}`);
    }

    // Копируем правила
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

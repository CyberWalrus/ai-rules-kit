import { checkAndUpdatePackage } from '../../lib/version-manager/check-and-update';
import { getPackageVersion } from '../../lib/version-manager/get-package-version';

/** Имя пакета для проверки обновлений */
const PACKAGE_NAME = 'cursor-rules-cli' as const;

/** Проверяет и обновляет пакет до последней версии при необходимости */
export async function ensureLatestVersion(packageDir: string): Promise<void> {
    if (packageDir === null || packageDir === undefined) {
        throw new Error('packageDir is required');
    }

    const currentVersion = await getPackageVersion(packageDir);
    const isUpdated = await checkAndUpdatePackage(PACKAGE_NAME, currentVersion);

    if (!isUpdated) {
        return;
    }

    console.log(`✅ Package updated to latest version`);
}

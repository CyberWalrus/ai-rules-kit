import { getPackageVersion } from '../../lib/version-manager/get-package-version';
import { notifyIfUpdateAvailable } from '../../lib/version-manager/notify-update';

/** Имя пакета для проверки обновлений */
const PACKAGE_NAME = 'cursor-rules-cli' as const;

/** Проверяет и уведомляет о доступной новой версии */
export async function ensureLatestVersion(packageDir: string): Promise<void> {
    if (packageDir === null || packageDir === undefined) {
        throw new Error('packageDir is required');
    }

    const currentVersion = await getPackageVersion(packageDir);
    await notifyIfUpdateAvailable(PACKAGE_NAME, currentVersion);
}

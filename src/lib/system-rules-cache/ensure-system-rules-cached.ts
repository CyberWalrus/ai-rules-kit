import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { GITHUB_REPO } from '../../model';
import { pathExists } from '../file-operations';
import { fetchSystemRulesTarball } from '../github-fetcher';
import { getLatestSystemRulesVersion } from '../github-fetcher/get-latest-system-rules-version';
import { getCachedSystemRulesDir } from './get-cached-system-rules-dir';

const VERSION_FILE = '.version';

/** Получает версию из кеша */
async function getCachedVersion(cacheDir: string): Promise<string | null> {
    const versionPath = join(cacheDir, VERSION_FILE);

    if (!(await pathExists(versionPath))) {
        return null;
    }

    try {
        const content = await readFile(versionPath, 'utf8');

        return content.trim();
    } catch {
        return null;
    }
}

/** Сохраняет версию в кеш */
async function saveCachedVersion(cacheDir: string, version: string): Promise<void> {
    const versionPath = join(cacheDir, VERSION_FILE);

    await writeFile(versionPath, version, 'utf8');
}

/** Сравнивает две версии (возвращает true, если version1 > version2) */
function compareVersions(version1: string, version2: string): boolean {
    return version1.localeCompare(version2, undefined, { numeric: true, sensitivity: 'base' }) > 0;
}

/** Обеспечивает наличие системных правил в кеше */
export async function ensureSystemRulesCached(forceRefresh: boolean = false): Promise<string> {
    const cacheDir = getCachedSystemRulesDir();
    const cachedVersion = await getCachedVersion(cacheDir);
    const cacheExists = cachedVersion !== null && (await pathExists(join(cacheDir, 'core-system-instructions.md')));

    let latestVersion: string | null = null;
    let githubError = false;

    try {
        latestVersion = await getLatestSystemRulesVersion(GITHUB_REPO);
    } catch {
        githubError = true;
    }

    if (latestVersion === null) {
        githubError = true;
    }

    if (githubError) {
        if (!cacheExists) {
            throw new Error(
                'GitHub недоступен и кеш системных правил отсутствует. Проверьте подключение к интернету и попробуйте снова.',
            );
        }

        return cacheDir;
    }

    if (
        forceRefresh ||
        !cacheExists ||
        cachedVersion === null ||
        (latestVersion !== null && compareVersions(latestVersion, cachedVersion))
    ) {
        if (latestVersion === null) {
            throw new Error('Не удалось получить версию системных правил');
        }

        const tmpDir = join(tmpdir(), `cursor-rules-system-rules-${Date.now()}`);

        try {
            await fetchSystemRulesTarball(GITHUB_REPO, latestVersion, tmpDir);
            await mkdir(cacheDir, { recursive: true });

            if (cacheExists) {
                await rm(cacheDir, { force: true, recursive: true });
                await mkdir(cacheDir, { recursive: true });
            }

            const { cp, readdir } = await import('node:fs/promises');

            const systemRulesSource = join(tmpDir, 'system-rules');
            const systemRulesExists = await pathExists(systemRulesSource);

            if (systemRulesExists) {
                await cp(systemRulesSource, cacheDir, { force: true, recursive: true });
            } else {
                const entries = await readdir(tmpDir, { withFileTypes: true });
                const hasSystemRulesFiles = entries.some(
                    (entry) =>
                        entry.isFile() &&
                        (entry.name === 'core-system-instructions.md' ||
                            entry.name === 'mcp.json' ||
                            entry.name.endsWith('.template.md')),
                );

                if (hasSystemRulesFiles) {
                    await Promise.all(
                        entries.map(async (entry) => {
                            if (entry.isFile()) {
                                await cp(join(tmpDir, entry.name), join(cacheDir, entry.name), { force: true });
                            }
                        }),
                    );
                } else {
                    throw new Error('Системные правила не найдены в скачанном архиве');
                }
            }

            await saveCachedVersion(cacheDir, latestVersion);
        } finally {
            await rm(tmpDir, { force: true, recursive: true });
        }
    }

    return cacheDir;
}

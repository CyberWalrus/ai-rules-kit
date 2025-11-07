import { readConfigFile } from '../file-operations/read-config-file';

/** Получает текущую версию правил из целевой директории */
export async function getCurrentVersion(targetDir: string): Promise<string | null> {
    if (targetDir === null || targetDir === undefined) {
        throw new Error('targetDir is required');
    }

    const config = await readConfigFile(targetDir);

    if (config === null) {
        return null;
    }

    return config.version;
}

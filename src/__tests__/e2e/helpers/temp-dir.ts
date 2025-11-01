import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Создает временную директорию для тестов */
async function createTempDir(): Promise<string> {
    const tempBaseDir = tmpdir();
    const tempProjectDir = join(
        tempBaseDir,
        `cursor-rules-test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    );

    await mkdir(tempProjectDir, { recursive: true });

    return tempProjectDir;
}

/** Удаляет временную директорию */
async function cleanupTempDir(path: string): Promise<void> {
    if (!path) {
        return;
    }

    await rm(path, { force: true, recursive: true });
}

/** Возвращает путь к временной директории проекта */
function getTempProjectDir(): string {
    const tempBaseDir = tmpdir();

    return join(tempBaseDir, `cursor-rules-test-${Date.now()}`);
}

/** Фабрика для работы с временными директориями */
export const tempDir: {
    cleanup: (path: string) => Promise<void>;
    create: () => Promise<string>;
    getProjectDir: () => string;
} = {
    cleanup: cleanupTempDir,
    create: createTempDir,
    getProjectDir: getTempProjectDir,
};

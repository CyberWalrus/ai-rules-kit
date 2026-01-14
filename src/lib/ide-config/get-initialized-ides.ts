import { readConfigFile } from '../file-operations/read-config-file';
import type { IdeType } from './index';

/** Все поддерживаемые IDE */
const ALL_IDES: IdeType[] = ['cursor', 'trae', 'claude-code'];

/**
 * Возвращает список инициализированных IDE в проекте
 * @param targetDir - Целевая директория проекта
 * @returns Массив инициализированных IDE
 */
export async function getInitializedIdes(targetDir: string): Promise<IdeType[]> {
    const initialized: IdeType[] = [];

    for (const ideType of ALL_IDES) {
        const config = await readConfigFile(targetDir, ideType);
        if (config !== null) {
            initialized.push(ideType);
        }
    }

    return initialized;
}

/**
 * Возвращает список не инициализированных IDE в проекте
 * @param targetDir - Целевая директория проекта
 * @returns Массив не инициализированных IDE
 */
export async function getUninitializedIdes(targetDir: string): Promise<IdeType[]> {
    const initialized = await getInitializedIdes(targetDir);

    return ALL_IDES.filter((ide) => !initialized.includes(ide));
}

/** Экспорт всех поддерживаемых IDE для использования в других модулях */
export { ALL_IDES };

import { join } from 'node:path';

import { getCursorConfigDir } from './get-cursor-config-dir';

/** Определяет директорию для глобальных правил Cursor */
export async function getCursorRulesDir(): Promise<string> {
    const configDir = await getCursorConfigDir();

    return join(configDir, 'rules');
}

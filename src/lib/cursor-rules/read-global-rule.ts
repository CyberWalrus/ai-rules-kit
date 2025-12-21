import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getCursorRulesDir } from '../cursor-config';

/** Читает файл глобального правила Cursor */
export async function readGlobalRule(ruleName: string): Promise<string | null> {
    try {
        const rulesDir = await getCursorRulesDir();
        const rulePath = join(rulesDir, ruleName);

        return await readFile(rulePath, 'utf-8');
    } catch {
        return null;
    }
}

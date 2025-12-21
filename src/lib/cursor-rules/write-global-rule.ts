import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { getCursorRulesDir } from '../cursor-config';

/** Записывает файл глобального правила Cursor */
export async function writeGlobalRule(ruleName: string, content: string): Promise<void> {
    const rulesDir = await getCursorRulesDir();
    const rulePath = join(rulesDir, ruleName);
    const ruleDir = dirname(rulePath);

    await mkdir(ruleDir, { recursive: true });
    await writeFile(rulePath, content, 'utf-8');
}

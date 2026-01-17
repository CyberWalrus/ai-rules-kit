import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isEmptyString } from '../helpers';
import { ensureSystemRulesCached } from './ensure-system-rules-cached';

/** Читает файл из кеша системных правил */
export async function getSystemRulesFile(fileName: string, forceRefresh: boolean = false): Promise<string> {
    if (isEmptyString(fileName)) {
        throw new Error('fileName is required');
    }

    const cacheDir = await ensureSystemRulesCached(forceRefresh);
    const filePath = join(cacheDir, fileName);

    try {
        return await readFile(filePath, 'utf8');
    } catch (error) {
        throw new Error(
            `Failed to read system rules file "${fileName}": ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

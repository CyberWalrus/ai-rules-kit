import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { VERSION_FILE_NAME } from '../../model';
import { isEmptyString } from '../helpers';
import type { IdeType } from '../ide-config';
import { getClaudeSettingsPath, getProjectIdeDir } from '../ide-config';
import { pathExists } from './path-exists';

/**
 * Удаляет конфигурационный файл для указанной IDE
 * @param targetDir - Целевая директория проекта
 * @param ideType - Тип IDE
 */
export async function deleteConfigFile(targetDir: string, ideType: IdeType): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const ideDir = getProjectIdeDir(ideType);
    const configPath = join(targetDir, ideDir, VERSION_FILE_NAME);
    const configExists = await pathExists(configPath);

    if (configExists) {
        await rm(configPath, { force: true });
    }

    // Для Claude Code также удаляем settings.json
    if (ideType === 'claude-code') {
        const settingsPath = join(targetDir, getClaudeSettingsPath());
        const settingsExists = await pathExists(settingsPath);

        if (settingsExists) {
            await rm(settingsPath, { force: true });
        }
    }
}

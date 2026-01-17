import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getClaudeMainFileName } from '../../../lib/claude-code-config';
import { calculateDiff } from '../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget, pathExists, readConfigFile, writeConfigFile } from '../../../lib/file-operations';
import { BLOCK_END_TAG, BLOCK_START_TAG } from '../../../lib/file-operations/copy-rules-to-claude-code';
import { fetchPromptsTarball, fetchSystemRulesTarball } from '../../../lib/github-fetcher';
import { askConfirmation } from '../../../lib/helpers';
import { t } from '../../../lib/i18n';
import type { IdeType } from '../../../lib/ide-config';
import { getIdeRulesDir, getInitializedIdes } from '../../../lib/ide-config';
import { compareCalVerVersions } from '../../../lib/version-manager/compare-calver-versions';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { getVersionsWithRetry } from '../../../lib/version-manager/get-versions-with-retry';
import { GITHUB_REPO, upgradeCommandParamsSchema } from '../../../model';

/** Метки IDE для отображения */
const IDE_LABELS: Record<string, string> = {
    'claude-code': 'Claude Code',
    cursor: 'Cursor',
    trae: 'TRAE',
};

/**
 * Проверяет наличие тегов блока правил в CLAUDE.md
 * @param claudeMdPath - Путь к файлу CLAUDE.md
 * @returns true если оба тега присутствуют
 */
async function hasClaudeRulesTags(claudeMdPath: string): Promise<boolean> {
    const fileExists = await pathExists(claudeMdPath);
    if (!fileExists) {
        return false;
    }

    const content = await readFile(claudeMdPath, 'utf8');

    return content.includes(BLOCK_START_TAG) && content.includes(BLOCK_END_TAG);
}

/**
 * Обновляет правила для одной IDE
 * @param packageDir - Директория пакета
 * @param targetDir - Целевая директория проекта
 * @param ideType - Тип IDE
 * @param latestPromptsVersion - Последняя версия промптов
 * @param latestSystemRulesVersion - Последняя версия системных правил
 * @param tmpDir - Временная директория с скачанными правилами
 */
async function upgradeIde(
    packageDir: string,
    targetDir: string,
    ideType: IdeType,
    latestPromptsVersion: string,
    latestSystemRulesVersion: string | null,
    tmpDir: string,
): Promise<void> {
    const config = await readConfigFile(targetDir, ideType);
    if (config === null) {
        return;
    }

    const currentPromptsVersion = config.promptsVersion ?? config.version;

    if (currentPromptsVersion == null) {
        console.warn(`  ${IDE_LABELS[ideType]}: пропущено (версия не найдена в конфиге)`);

        return;
    }

    // Проверяем обновление для этой IDE
    if (currentPromptsVersion === latestPromptsVersion) {
        // Обновляем cliVersion даже если промпты актуальны
        const newCliVersion = await getPackageVersion(packageDir);
        if (config.cliVersion !== newCliVersion) {
            config.cliVersion = newCliVersion;
            config.updatedAt = new Date().toISOString();
            await writeConfigFile(targetDir, config, ideType);
        }
        console.log(`  ${IDE_LABELS[ideType]}: уже актуально (${currentPromptsVersion})`);

        return;
    }

    const versionComparison = compareCalVerVersions(currentPromptsVersion, latestPromptsVersion);
    const reverseComparison = compareCalVerVersions(latestPromptsVersion, currentPromptsVersion);

    if (versionComparison.changeType === 'none' && reverseComparison.changeType !== 'none') {
        console.warn(
            `  ${IDE_LABELS[ideType]}: локальная версия ${currentPromptsVersion} новее версии GitHub ${latestPromptsVersion}`,
        );

        // Для локально более новой версии не обновляем
        return;
    }

    const currentSystemRulesVersion = config.systemRulesVersion;
    const shouldUpdateSystemRules =
        latestSystemRulesVersion !== null &&
        (currentSystemRulesVersion === undefined || currentSystemRulesVersion !== latestSystemRulesVersion);

    // Проверяем наличие тегов в CLAUDE.md для Claude Code
    let updateExistingClaudeMd = false;
    if (ideType === 'claude-code') {
        const claudeMdPath = join(targetDir, getClaudeMainFileName());
        updateExistingClaudeMd = await hasClaudeRulesTags(claudeMdPath);
    }

    await calculateDiff(tmpDir, targetDir, getIdeRulesDir(ideType), ideType);
    await copyRulesToTarget(
        tmpDir,
        targetDir,
        ideType,
        config.ignoreList ?? [],
        config.fileOverrides ?? [],
        getIdeRulesDir(ideType),
        updateExistingClaudeMd,
    );

    const cliVersion = await getPackageVersion(packageDir);
    config.cliVersion = cliVersion;
    config.promptsVersion = latestPromptsVersion;
    if (shouldUpdateSystemRules && latestSystemRulesVersion !== null) {
        config.systemRulesVersion = latestSystemRulesVersion;
    }
    config.updatedAt = new Date().toISOString();
    await writeConfigFile(targetDir, config, ideType);

    console.log(`  ${IDE_LABELS[ideType]}: обновлено ${currentPromptsVersion} → ${latestPromptsVersion}`);
}

/** Обновляет правила до последней версии для всех инициализированных IDE */
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function upgradeCommand(packageDir: string, targetDir: string): Promise<void> {
    try {
        upgradeCommandParamsSchema.parse({ packageDir, targetDir });
    } catch (error) {
        const zodError = error as { issues?: Array<{ path: Array<number | string> }> };
        const firstIssue = zodError.issues?.[0];
        if (firstIssue) {
            const firstPath = firstIssue.path[0];
            if (firstPath === 'packageDir') {
                throw new Error('packageDir is required');
            }
            if (firstPath === 'targetDir') {
                throw new Error('targetDir is required');
            }
        }
        throw error;
    }

    const initializedIdes = await getInitializedIdes(targetDir);

    if (initializedIdes.length === 0) {
        throw new Error(t('command.upgrade.not-initialized'));
    }

    console.log(`Найдено инициализированных IDE: ${initializedIdes.map((ide) => IDE_LABELS[ide]).join(', ')}`);

    const { promptsVersion: latestPromptsVersion, systemRulesVersion: latestSystemRulesVersion } =
        await getVersionsWithRetry();

    if (latestPromptsVersion == null) {
        console.warn(t('command.upgrade.no-internet', { version: 'unknown' }));

        const shouldUseLocal = await askConfirmation(t('command.upgrade.use-local'));

        if (!shouldUseLocal) {
            throw new Error(t('command.upgrade.use-local.no'));
        }

        console.log(t('command.upgrade.use-local.yes', { version: 'local' }));

        return;
    }

    // Проверяем версию первой IDE для определения необходимости обновления
    const firstIdeConfig = await readConfigFile(targetDir, initializedIdes[0]);
    const firstIdeVersion = firstIdeConfig?.promptsVersion ?? firstIdeConfig?.version;

    if (firstIdeVersion === latestPromptsVersion && initializedIdes.length === 1) {
        // Обновляем cliVersion даже если промпты актуальны
        const newCliVersion = await getPackageVersion(packageDir);
        if (firstIdeConfig && firstIdeConfig.cliVersion !== newCliVersion) {
            firstIdeConfig.cliVersion = newCliVersion;
            firstIdeConfig.updatedAt = new Date().toISOString();
            await writeConfigFile(targetDir, firstIdeConfig, initializedIdes[0]);
        }
        console.log(t('command.upgrade.up-to-date'));

        return;
    }

    const tmpDir = join(tmpdir(), `cursor-rules-${Date.now()}`);

    try {
        // Скачиваем правила один раз для всех IDE
        await Promise.all([
            fetchPromptsTarball(GITHUB_REPO, latestPromptsVersion, tmpDir),
            latestSystemRulesVersion !== null
                ? fetchSystemRulesTarball(GITHUB_REPO, latestSystemRulesVersion, tmpDir)
                : Promise.resolve(),
        ]);

        console.log('Обновление правил для IDE:');

        // Обновляем каждую IDE
        for (const ideType of initializedIdes) {
            await upgradeIde(packageDir, targetDir, ideType, latestPromptsVersion, latestSystemRulesVersion, tmpDir);
        }

        console.log(
            t('command.upgrade.success', { current: firstIdeVersion ?? 'unknown', latest: latestPromptsVersion }),
        );
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

import { isCancel, select } from '@clack/prompts';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runClaudeInit } from '../../../lib/claude-cli';
import { getClaudeMainFileName } from '../../../lib/claude-code-config';
import { copyRulesToTarget } from '../../../lib/file-operations/copy-rules-to-target';
import { pathExists } from '../../../lib/file-operations/path-exists';
import { readConfigFile } from '../../../lib/file-operations/read-config-file';
import { writeConfigFile } from '../../../lib/file-operations/write-config-file';
import { fetchPromptsTarball, fetchSystemRulesTarball } from '../../../lib/github-fetcher';
import { askConfirmation } from '../../../lib/helpers';
import { t } from '../../../lib/i18n';
import type { IdeType } from '../../../lib/ide-config';
import { ALL_IDES, getIdeRulesDir, getUninitializedIdes } from '../../../lib/ide-config';
import { readUserConfig } from '../../../lib/user-config';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { getVersionsWithRetry } from '../../../lib/version-manager/get-versions-with-retry';
import type { RulesConfig } from '../../../model';
import { GITHUB_REPO, initCommandParamsSchema } from '../../../model';

/** Метки IDE для отображения в UI */
const IDE_LABELS: Record<string, string> = {
    'claude-code': 'Claude Code',
    cursor: 'Cursor',
    trae: 'TRAE',
};

/** Команда инициализации правил */
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function initCommand(packageDir: string, targetDir: string): Promise<void> {
    try {
        initCommandParamsSchema.parse({ packageDir, targetDir });
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

    const currentUserConfig = await readUserConfig();
    const uninitializedIdes = await getUninitializedIdes(targetDir);

    if (uninitializedIdes.length === 0) {
        console.log(t('command.init.all-ides-initialized'));
        for (const ide of ALL_IDES) {
            console.log(`  - ${IDE_LABELS[ide]}`);
        }

        return;
    }

    // Определяем сообщение для select
    const initializedCount = ALL_IDES.length - uninitializedIdes.length;
    const selectMessage =
        initializedCount > 0
            ? `Выберите IDE для инициализации (${initializedCount} из ${ALL_IDES.length} уже инициализированы)`
            : 'Выберите IDE для инициализации';

    // Формируем опции: неинициализированные IDE + опция "Завершить работу"
    const selectOptions: Array<{ label: string; value: IdeType | 'done'; hint?: string }> = [
        ...uninitializedIdes.map((ide) => ({
            label: IDE_LABELS[ide],
            value: ide,
        })),
        { hint: 'выйти из команды', label: 'Завершить работу', value: 'done' },
    ];

    // Используем интерактивное меню из @clack/prompts
    const selected = await select<IdeType | 'done'>({
        message: selectMessage,
        options: selectOptions,
    });

    if (isCancel(selected)) {
        return;
    }

    if (selected === 'done') {
        return;
    }

    const ideType = selected;

    // Проверяем, что выбранная IDE еще не инициализирована
    const existingConfig = await readConfigFile(targetDir, ideType);
    if (existingConfig !== null) {
        const version = existingConfig.promptsVersion ?? existingConfig.version;
        throw new Error(`Rules already initialized with version ${version}`);
    }

    // Проверяем CLAUDE.md для Claude Code IDE
    let updateExistingClaudeMd = false;
    if (ideType === 'claude-code') {
        const existingClaudeMd = join(targetDir, getClaudeMainFileName());
        const claudeMdExists = await pathExists(existingClaudeMd);

        if (claudeMdExists) {
            // CLAUDE.md существует - спрашиваем про добавление правил
            const shouldUpdate = await askConfirmation('Найден существующий CLAUDE.md. Добавить правила в него?');
            if (shouldUpdate === false) {
                return;
            }
            updateExistingClaudeMd = true;
        } else {
            // CLAUDE.md не существует - предлагаем инициализацию через Claude CLI
            console.log('');
            console.log('⚠️  ВАЖНО: Если вы выберете инициализацию через Claude Code CLI:');
            console.log(
                '   1. После завершения инициализации Claude ЗАКРОЙТЕ процесс (Ctrl+C или остановите в терминале)',
            );
            console.log('   2. Затем нажмите Enter здесь, чтобы продолжить установку правил');
            console.log('');

            const shouldRunClaudeInit = await askConfirmation(
                'Инициализировать проект через Claude Code CLI (claude /init)?',
            );
            if (shouldRunClaudeInit) {
                console.log('');
                console.log('Запуск Claude Code CLI для инициализации...');
                console.log('После завершения работы Claude остановите процесс и вернитесь сюда.');
                console.log('');
                try {
                    await runClaudeInit(targetDir);
                    console.log('');
                    console.log('✓ Инициализация через Claude Code CLI завершена');
                    console.log('  Если процесс Claude всё ещё работает — остановите его (Ctrl+C)');
                    console.log('  Нажмите Enter, чтобы продолжить установку правил...');
                    console.log('');
                } catch (error) {
                    throw new Error(`Не удалось выполнить claude /init: ${String(error)}`);
                }
            }
        }
    }

    const { promptsVersion, systemRulesVersion } = await getVersionsWithRetry();
    if (promptsVersion === null) {
        throw new Error(t('command.init.fetch-failed'));
    }

    const tmpDir = join(tmpdir(), `ai-rules-kit-${Date.now()}`);

    try {
        await Promise.all([
            fetchPromptsTarball(GITHUB_REPO, promptsVersion, tmpDir),
            systemRulesVersion !== null
                ? fetchSystemRulesTarball(GITHUB_REPO, systemRulesVersion, tmpDir)
                : Promise.resolve(),
        ]);
        await copyRulesToTarget(tmpDir, targetDir, ideType, [], [], getIdeRulesDir(ideType), updateExistingClaudeMd);

        const cliVersion = await getPackageVersion(packageDir);
        const currentTimestamp = new Date().toISOString();
        const config: RulesConfig = {
            cliVersion,
            configVersion: '1.0.0',
            fileOverrides: [],
            ideType,
            ignoreList: [],
            installedAt: currentTimestamp,
            promptsVersion,
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: currentUserConfig?.language ?? 'en',
            },
            source: 'ai-rules-kit',
            systemRulesVersion: systemRulesVersion ?? undefined,
            updatedAt: currentTimestamp,
        };
        await writeConfigFile(targetDir, config, ideType);

        console.log(t('command.init.success', { version: promptsVersion }));
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}

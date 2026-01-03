import { cancel, isCancel, log, select } from '@clack/prompts';

import { copyToClipboard } from '../../../lib/clipboard';
import { getLatestSystemRulesVersion } from '../../../lib/github-fetcher/get-latest-system-rules-version';
import { t } from '../../../lib/i18n';
import {
    generateCurrentDatePrompt,
    generateMcpConfig,
    generateMetaInfoPrompt,
    getCoreSystemInstructions,
    removeYamlFrontmatter,
} from '../../../lib/prompts';
import {
    fillMissingMcpSettings,
    fillMissingMetaInfo,
    readUserConfig,
    validateMcpSettings,
    validateMetaInfo,
    writeUserConfig,
} from '../../../lib/user-config';
import { GITHUB_REPO } from '../../../model';

/** Тип системного файла для копирования */
type SystemFileType = 'core-instructions' | 'current-date' | 'mcp-config' | 'meta-info';

/** Команда работы с системными файлами */
export async function systemFilesCommand(): Promise<void> {
    let isGithubError = false;

    try {
        const latestVersion = await getLatestSystemRulesVersion(GITHUB_REPO);
        if (latestVersion === null) {
            isGithubError = true;
        }
    } catch {
        isGithubError = true;
    }

    const fileType = await select<SystemFileType>({
        message: t('command.system-files.select-type'),
        options: [
            {
                hint: t('command.system-files.core-instructions.hint'),
                label: t('command.system-files.core-instructions'),
                value: 'core-instructions',
            },
            {
                hint: t('command.system-files.meta-info.hint'),
                label: t('command.system-files.meta-info'),
                value: 'meta-info',
            },
            {
                hint: t('command.system-files.current-date.hint'),
                label: t('command.system-files.current-date'),
                value: 'current-date',
            },
            {
                hint: t('command.system-files.mcp-config.hint'),
                label: t('command.system-files.mcp-config'),
                value: 'mcp-config',
            },
        ],
    });

    if (isCancel(fileType)) {
        cancel(t('cli.interactive-menu.cancelled'));

        return;
    }

    try {
        const forceRefresh = isGithubError;

        let content: string;

        switch (fileType) {
            case 'core-instructions': {
                const rawContent = await getCoreSystemInstructions(forceRefresh);
                content = removeYamlFrontmatter(rawContent);
                break;
            }
            case 'meta-info': {
                let userConfig = await readUserConfig();
                const validation = validateMetaInfo(userConfig?.metaInfo);

                if (!validation.isValid) {
                    log.info(t('command.system-files.meta-info.missing-fields'));

                    const filledMetaInfo = await fillMissingMetaInfo(userConfig?.metaInfo, validation.missingFields);

                    if (filledMetaInfo === null) {
                        cancel(t('cli.interactive-menu.cancelled'));

                        return;
                    }

                    userConfig = {
                        language: userConfig?.language ?? 'en',
                        ...userConfig,
                        metaInfo: filledMetaInfo,
                    };

                    await writeUserConfig(userConfig);
                }

                const rawContent = await generateMetaInfoPrompt(userConfig?.metaInfo, forceRefresh);
                content = removeYamlFrontmatter(rawContent);
                break;
            }
            case 'current-date': {
                const rawContent = await generateCurrentDatePrompt(forceRefresh);
                content = removeYamlFrontmatter(rawContent);
                break;
            }
            case 'mcp-config': {
                let userConfig = await readUserConfig();
                const validation = validateMcpSettings(userConfig?.mcpSettings);

                if (!validation.isValid) {
                    log.info(t('command.system-files.mcp-config.missing-fields'));

                    const filledMcpSettings = await fillMissingMcpSettings(
                        userConfig?.mcpSettings,
                        validation.missingFields,
                    );

                    if (filledMcpSettings === null) {
                        cancel(t('cli.interactive-menu.cancelled'));

                        return;
                    }

                    userConfig = {
                        language: userConfig?.language ?? 'en',
                        ...userConfig,
                        mcpSettings: filledMcpSettings,
                    };

                    await writeUserConfig(userConfig);
                }

                content = await generateMcpConfig(userConfig?.mcpSettings, forceRefresh);
                break;
            }
        }

        await copyToClipboard(content);

        const copyMessages: Record<SystemFileType, string> = {
            'core-instructions': t('command.system-files.copied.core-instructions'),
            'current-date': t('command.system-files.copied.current-date'),
            'mcp-config': t('command.system-files.copied.mcp-config'),
            'meta-info': t('command.system-files.copied.meta-info'),
        };

        log.success(copyMessages[fileType]);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(t('command.system-files.error', { message }));
    }
}

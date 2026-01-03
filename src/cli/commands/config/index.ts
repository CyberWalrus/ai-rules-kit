import { cancel, isCancel, log, outro, select, text } from '@clack/prompts';

import { t } from '../../../lib/i18n';
import { readUserConfig, writeUserConfig } from '../../../lib/user-config';
import type { McpSettings, UserConfig, UserMetaInfo } from '../../../model';

/** Тип поля конфигурации для редактирования */
type ConfigField = 'back-to-menu' | 'finish' | 'language' | 'mcp-settings' | 'meta-info';

/** Тип поля метаинформации для редактирования */
type MetaInfoField =
    | 'age'
    | 'communication-style'
    | 'device'
    | 'finish'
    | 'language'
    | 'location'
    | 'name'
    | 'os'
    | 'role'
    | 'stack'
    | 'tool-versions';

/** Тип поля настроек MCP для редактирования */
type McpSettingsField = 'ai-model' | 'api-key' | 'api-providers' | 'finish';

const NOT_SET_LABEL = '(не задано)';

/** Форматирует значение для отображения */
function formatValue(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return NOT_SET_LABEL;
    }

    return String(value);
}

/** Редактирует метаинформацию */
// eslint-disable-next-line sonarjs/cognitive-complexity
async function editMetaInfo(currentMetaInfo: UserMetaInfo | null | undefined): Promise<UserMetaInfo | undefined> {
    const metaInfo: UserMetaInfo = currentMetaInfo ? { ...currentMetaInfo } : {};

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const currentName = metaInfo.name ?? '';
        const currentAge = metaInfo.age?.toString() ?? '';
        const currentRole = metaInfo.role ?? '';
        const currentStack = metaInfo.stack ?? '';
        const currentToolVersions = metaInfo.toolVersions ?? '';
        const currentOs = metaInfo.os ?? '';
        const currentDevice = metaInfo.device ?? '';
        const currentLocation = metaInfo.location ?? '';
        const currentLanguage = metaInfo.language ?? '';
        const currentCommunicationStyle = metaInfo.communicationStyle ?? '';

        const field = await select<MetaInfoField>({
            message: t('command.config.meta-info.select-field'),
            options: [
                {
                    label: `${t('command.config.meta-info.field.name')}: ${formatValue(currentName)}`,
                    value: 'name',
                },
                { label: `${t('command.config.meta-info.field.age')}: ${formatValue(currentAge)}`, value: 'age' },
                {
                    label: `${t('command.config.meta-info.field.role')}: ${formatValue(currentRole)}`,
                    value: 'role',
                },
                {
                    label: `${t('command.config.meta-info.field.stack')}: ${formatValue(currentStack)}`,
                    value: 'stack',
                },
                {
                    label: `${t('command.config.meta-info.field.tool-versions')}: ${formatValue(currentToolVersions)}`,
                    value: 'tool-versions',
                },
                { label: `${t('command.config.meta-info.field.os')}: ${formatValue(currentOs)}`, value: 'os' },
                {
                    label: `${t('command.config.meta-info.field.device')}: ${formatValue(currentDevice)}`,
                    value: 'device',
                },
                {
                    label: `${t('command.config.meta-info.field.location')}: ${formatValue(currentLocation)}`,
                    value: 'location',
                },
                {
                    label: `${t('command.config.meta-info.field.language')}: ${formatValue(currentLanguage)}`,
                    value: 'language',
                },
                {
                    label: `${t('command.config.meta-info.field.communication-style')}: ${formatValue(currentCommunicationStyle)}`,
                    value: 'communication-style',
                },
                { label: t('command.config.meta-info.field.finish'), value: 'finish' },
            ],
        });

        if (isCancel(field)) {
            cancel(t('cli.interactive-menu.cancelled'));

            return currentMetaInfo ?? undefined;
        }

        if (field === 'finish') {
            break;
        }

        let value: number | string | undefined;

        if (field === 'age') {
            const ageInput = await text({
                initialValue: currentAge,
                message: t('command.config.meta-info.prompt.age'),
            });

            if (isCancel(ageInput)) {
                continue;
            }

            const ageValue = ageInput.trim();
            if (ageValue === '') {
                value = undefined;
            } else {
                const parsed = Number.parseInt(ageValue, 10);
                value = Number.isNaN(parsed) ? undefined : parsed;
            }
        } else {
            const prompts: Record<string, string> = {
                'communication-style': t('command.config.meta-info.prompt.communication-style'),
                device: t('command.config.meta-info.prompt.device'),
                language: t('command.config.meta-info.prompt.language'),
                location: t('command.config.meta-info.prompt.location'),
                name: t('command.config.meta-info.prompt.name'),
                os: t('command.config.meta-info.prompt.os'),
                role: t('command.config.meta-info.prompt.role'),
                stack: t('command.config.meta-info.prompt.stack'),
                'tool-versions': t('command.config.meta-info.prompt.tool-versions'),
            };

            let initialValue = '';
            if (field === 'name') {
                initialValue = currentName;
            } else if (field === 'role') {
                initialValue = currentRole;
            } else if (field === 'stack') {
                initialValue = currentStack;
            } else if (field === 'tool-versions') {
                initialValue = currentToolVersions;
            } else if (field === 'os') {
                initialValue = currentOs;
            } else if (field === 'device') {
                initialValue = currentDevice;
            } else if (field === 'location') {
                initialValue = currentLocation;
            } else if (field === 'language') {
                initialValue = currentLanguage;
            } else {
                initialValue = currentCommunicationStyle;
            }

            const fieldInput = await text({
                initialValue,
                message: prompts[field],
            });

            if (isCancel(fieldInput)) {
                continue;
            }

            value = fieldInput.trim() === '' ? undefined : fieldInput.trim();
        }

        const fieldMap: Record<string, keyof UserMetaInfo> = {
            age: 'age',
            'communication-style': 'communicationStyle',
            device: 'device',
            language: 'language',
            location: 'location',
            name: 'name',
            os: 'os',
            role: 'role',
            stack: 'stack',
            'tool-versions': 'toolVersions',
        };

        const key = fieldMap[field];
        if (key) {
            metaInfo[key] = value as never;
        }
    }

    return Object.keys(metaInfo).length === 0 ? undefined : metaInfo;
}

/** Редактирует настройки MCP серверов */
// eslint-disable-next-line sonarjs/cognitive-complexity -- интерактивное меню требует множественных условий
async function editMcpSettings(currentMcpSettings: McpSettings | null | undefined): Promise<McpSettings | undefined> {
    const DEFAULT_AI_MODEL = 'openai/gpt-oss-120b';
    const mcpSettings: McpSettings = currentMcpSettings
        ? { ...currentMcpSettings }
        : {
              aiModel: DEFAULT_AI_MODEL,
              apiKey: '',
          };

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const currentApiKey = mcpSettings.apiKey ?? '';
        const currentAiModel = mcpSettings.aiModel ?? DEFAULT_AI_MODEL;
        const currentApiProviders = mcpSettings.apiProviders ?? '';

        const field = await select<McpSettingsField>({
            message: t('command.config.mcp-settings.select-field'),
            options: [
                {
                    label: `${t('command.config.mcp-settings.field.api-key')}: ${formatValue(currentApiKey)}`,
                    value: 'api-key',
                },
                {
                    label: `${t('command.config.mcp-settings.field.ai-model')}: ${formatValue(currentAiModel)}`,
                    value: 'ai-model',
                },
                {
                    label: `${t('command.config.mcp-settings.field.api-providers')}: ${formatValue(currentApiProviders)}`,
                    value: 'api-providers',
                },
                { label: t('command.config.mcp-settings.field.finish'), value: 'finish' },
            ],
        });

        if (isCancel(field)) {
            cancel(t('cli.interactive-menu.cancelled'));

            return currentMcpSettings ?? undefined;
        }

        if (field === 'finish') {
            break;
        }

        const prompts: Record<string, string> = {
            'ai-model': t('command.config.mcp-settings.prompt.ai-model'),
            'api-key': t('command.config.mcp-settings.prompt.api-key'),
            'api-providers': t('command.config.mcp-settings.prompt.api-providers'),
        };

        let initialValue = '';
        if (field === 'api-key') {
            initialValue = currentApiKey;
        } else if (field === 'ai-model') {
            initialValue = currentAiModel;
        } else {
            initialValue = currentApiProviders;
        }

        const fieldInput = await text({
            initialValue,
            message: prompts[field],
        });

        if (isCancel(fieldInput)) {
            continue;
        }

        const value = fieldInput.trim();

        if (field === 'api-key') {
            mcpSettings.apiKey = value;
        } else if (field === 'ai-model') {
            mcpSettings.aiModel = value === '' ? DEFAULT_AI_MODEL : value;
        } else if (field === 'api-providers') {
            mcpSettings.apiProviders = value === '' ? undefined : value;
        }
    }

    if (mcpSettings.apiKey === '') {
        return undefined;
    }

    return mcpSettings;
}

/** Результат выполнения команды конфигурации */
export type ConfigCommandResult = 'back-to-menu' | 'finish';

/** Команда настройки глобальной конфигурации */
// eslint-disable-next-line sonarjs/cognitive-complexity -- интерактивное меню требует множественных условий
export async function configCommand(): Promise<ConfigCommandResult> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const currentConfig = await readUserConfig();
        const currentLanguage = currentConfig?.language ?? 'en';
        const currentMetaInfo = currentConfig?.metaInfo;
        const currentMcpSettings = currentConfig?.mcpSettings;

        const field = await select<ConfigField>({
            message: t('command.config.select-field'),
            options: [
                { label: `${t('command.config.field.language')}: ${currentLanguage}`, value: 'language' },
                {
                    label: `${t('command.config.field.meta-info')}: ${currentMetaInfo ? '(настроено)' : '(не настроено)'}`,
                    value: 'meta-info',
                },
                {
                    label: `${t('command.config.field.mcp-settings')}: ${currentMcpSettings ? '(настроено)' : '(не настроено)'}`,
                    value: 'mcp-settings',
                },
                { label: t('command.config.field.back-to-menu'), value: 'back-to-menu' },
                { label: t('command.config.field.finish'), value: 'finish' },
            ],
        });

        if (isCancel(field)) {
            cancel(t('cli.interactive-menu.cancelled'));

            return 'finish';
        }

        if (field === 'back-to-menu') {
            return 'back-to-menu';
        }

        if (field === 'finish') {
            outro(t('cli.interactive-menu.goodbye'));

            return 'finish';
        }

        if (field === 'language') {
            const language = await select<'en' | 'ru'>({
                initialValue: currentLanguage,
                message: t('command.config.select-language'),
                options: [
                    { label: t('command.config.language.en'), value: 'en' },
                    { label: t('command.config.language.ru'), value: 'ru' },
                ],
            });

            if (isCancel(language)) {
                continue;
            }

            const config: UserConfig = {
                ...currentConfig,
                language,
            };

            await writeUserConfig(config);
            log.success(t('command.config.success', { language }));
        } else if (field === 'meta-info') {
            const metaInfo = await editMetaInfo(currentMetaInfo);

            const config: UserConfig = {
                language: currentConfig?.language ?? 'en',
                ...currentConfig,
                metaInfo,
            };

            await writeUserConfig(config);
            log.success(t('command.config.meta-info.success'));
        } else if (field === 'mcp-settings') {
            const mcpSettings = await editMcpSettings(currentMcpSettings);

            const config: UserConfig = {
                language: currentConfig?.language ?? 'en',
                ...currentConfig,
                mcpSettings,
            };

            await writeUserConfig(config);
            log.success(t('command.config.mcp-settings.success'));
        }
    }
}

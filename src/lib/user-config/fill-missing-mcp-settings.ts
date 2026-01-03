import { cancel, isCancel, log, text } from '@clack/prompts';

import type { McpSettings } from '../../model/types/main';
import { t } from '../i18n';
import type { Translations } from '../i18n/types';

/** Маппинг полей для отображения */
const FIELD_PROMPTS: Record<keyof McpSettings, keyof Translations> = {
    aiModel: 'command.config.mcp-settings.prompt.ai-model',
    apiKey: 'command.config.mcp-settings.prompt.api-key',
    apiProviders: 'command.config.mcp-settings.prompt.api-providers',
};

/** Заполняет недостающие обязательные поля MCP настроек */
export async function fillMissingMcpSettings(
    currentMcpSettings: McpSettings | null | undefined,
    missingFields: Array<keyof McpSettings>,
): Promise<McpSettings | null> {
    const DEFAULT_AI_MODEL = 'openai/gpt-oss-120b';
    const mcpSettings: McpSettings = currentMcpSettings
        ? { ...currentMcpSettings }
        : {
              aiModel: DEFAULT_AI_MODEL,
              apiKey: '',
          };

    log.info(t('command.system-files.mcp-config.filling-fields'));

    for (const field of missingFields) {
        const currentValue = mcpSettings[field];
        let initialValue = '';

        if (field === 'apiKey') {
            initialValue = currentValue ?? '';
        } else if (field === 'aiModel') {
            initialValue = currentValue ?? DEFAULT_AI_MODEL;
        } else {
            initialValue = currentValue ?? '';
        }

        const fieldInput = await text({
            initialValue,
            message: t(FIELD_PROMPTS[field]),
        });

        if (isCancel(fieldInput)) {
            cancel(t('cli.interactive-menu.cancelled'));

            return null;
        }

        const value = fieldInput.trim();

        if (field === 'apiKey') {
            mcpSettings.apiKey = value;
        } else if (field === 'aiModel') {
            mcpSettings.aiModel = value === '' ? DEFAULT_AI_MODEL : value;
        }
    }

    log.success(t('command.system-files.mcp-config.filled'));

    return mcpSettings;
}

import { cancel, confirm, isCancel, text } from '@clack/prompts';

import { t } from '../../../lib/i18n';
import { readMcpConfig, writeMcpConfig } from '../../../lib/mcp-config';
import type { McpConfig, McpServerConfig } from '../../../model';

const CANCELLED_MESSAGE_KEY = 'cli.interactive-menu.cancelled';

/** Запрашивает переменные окружения интерактивно */
async function promptEnvironmentVariables(): Promise<Record<string, string>> {
    const env: Record<string, string> = {};
    let isAddingMore = true;

    while (isAddingMore) {
        const envKeyInput = await text({
            message: t('command.set-mcp-server.prompt.env-key'),
            placeholder: 'API_KEY',
        });

        if (isCancel(envKeyInput)) {
            cancel(t(CANCELLED_MESSAGE_KEY));
            process.exit(0);
        }

        if (envKeyInput.trim() === '') {
            break;
        }

        const envValueInput = await text({
            message: t('command.set-mcp-server.prompt.env-value'),
            placeholder: 'your-api-key-here',
        });

        if (isCancel(envValueInput)) {
            cancel(t(CANCELLED_MESSAGE_KEY));
            process.exit(0);
        }

        env[envKeyInput.trim()] = envValueInput.trim();

        const addMoreInput = await confirm({
            initialValue: false,
            message: t('command.set-mcp-server.prompt.add-env'),
        });

        if (isCancel(addMoreInput)) {
            cancel(t(CANCELLED_MESSAGE_KEY));
            process.exit(0);
        }

        isAddingMore = addMoreInput === true;
    }

    return env;
}

/** Парсит аргументы из строки */
function parseArgs(argsString: string): string[] {
    if (argsString.trim() === '') {
        return [];
    }

    return argsString
        .split(',')
        .map((arg) => arg.trim())
        .filter((arg) => arg !== '');
}

/** Команда установки MCP сервера */
export async function setMcpServerCommand(): Promise<void> {
    const serverNameInput = await text({
        message: t('command.set-mcp-server.prompt.server-name'),
        placeholder: 'context7',
    });

    if (isCancel(serverNameInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const serverName = serverNameInput.trim();

    if (serverName === '') {
        throw new Error(t('command.set-mcp-server.error.empty-server-name'));
    }

    const existingConfig = await readMcpConfig();
    const config: McpConfig = existingConfig ?? { mcpServers: {} };

    if (config.mcpServers[serverName] != null) {
        const shouldUpdate = await confirm({
            initialValue: true,
            message: t('command.set-mcp-server.prompt.update-existing'),
        });

        if (isCancel(shouldUpdate)) {
            cancel(t(CANCELLED_MESSAGE_KEY));

            return;
        }

        if (shouldUpdate === false) {
            cancel(t('command.set-mcp-server.cancelled'));

            return;
        }
    }

    const existingServer = config.mcpServers[serverName];
    const existingCommand = existingServer?.command ?? '';
    const existingArgs = existingServer?.args?.join(', ') ?? '';

    const commandInput = await text({
        initialValue: existingCommand,
        message: t('command.set-mcp-server.prompt.command'),
        placeholder: 'npx',
    });

    if (isCancel(commandInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const command = commandInput.trim();

    if (command === '') {
        throw new Error(t('command.set-mcp-server.error.empty-command'));
    }

    const argsInput = await text({
        initialValue: existingArgs,
        message: t('command.set-mcp-server.prompt.args'),
        placeholder: '-y, @upstash/context7-mcp@latest',
    });

    if (isCancel(argsInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const args = parseArgs(argsInput);
    const env = await promptEnvironmentVariables();

    const serverConfig: McpServerConfig = {
        args: args.length ? args : undefined,
        command,
        env: Object.keys(env).length ? env : undefined,
    };

    config.mcpServers[serverName] = serverConfig;

    await writeMcpConfig(config);

    console.log(t('command.set-mcp-server.success', { serverName }));
}

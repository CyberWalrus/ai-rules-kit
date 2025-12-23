import { cancel, isCancel, log, select } from '@clack/prompts';
import { fileURLToPath } from 'node:url';

import { copyToClipboard } from '../../../lib/clipboard';
import { t } from '../../../lib/i18n';
import {
    generateCurrentDatePrompt,
    generateMcpConfig,
    generateMetaInfoPrompt,
    getCoreSystemInstructions,
} from '../../../lib/prompts';
import { readUserConfig } from '../../../lib/user-config';
import { getPackageDir } from '../../main/get-package-dir';

const currentFilePath = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);

/** Тип системного файла для копирования */
type SystemFileType = 'core-instructions' | 'current-date' | 'mcp-config' | 'meta-info';

/** Команда работы с системными файлами */
export async function systemFilesCommand(): Promise<void> {
    const packageDir = getPackageDir(currentFilePath);
    if (packageDir === null || packageDir === undefined) {
        throw new Error(t('cli.main.package-dir-not-found'));
    }

    const fileType = await select<SystemFileType>({
        message: t('command.system-files.select-type'),
        options: [
            { label: t('command.system-files.core-instructions'), value: 'core-instructions' },
            { label: t('command.system-files.meta-info'), value: 'meta-info' },
            { label: t('command.system-files.current-date'), value: 'current-date' },
            { label: t('command.system-files.mcp-config'), value: 'mcp-config' },
        ],
    });

    if (isCancel(fileType)) {
        cancel(t('cli.interactive-menu.cancelled'));

        return;
    }

    try {
        let content: string;

        switch (fileType) {
            case 'core-instructions':
                content = await getCoreSystemInstructions(packageDir);
                break;
            case 'meta-info': {
                const userConfig = await readUserConfig();
                content = await generateMetaInfoPrompt(packageDir, userConfig?.metaInfo);
                break;
            }
            case 'current-date':
                content = await generateCurrentDatePrompt(packageDir);
                break;
            case 'mcp-config':
                content = await generateMcpConfig(packageDir);
                break;
        }

        await copyToClipboard(content);
        log.success(t('command.system-files.copied'));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(t('command.system-files.error', { message }));
    }
}

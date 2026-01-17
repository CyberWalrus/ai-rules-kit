import { isCancel, select } from '@clack/prompts';

import { deleteConfigFile, deleteRulesFromTarget } from '../../../lib/file-operations';
import { askConfirmation } from '../../../lib/helpers';
import { t } from '../../../lib/i18n';
import type { IdeType } from '../../../lib/ide-config';
import { getInitializedIdes } from '../../../lib/ide-config';
import { resetCommandParamsSchema } from '../../../model';

/** Метки IDE для отображения в UI */
const IDE_LABELS: Record<string, string> = {
    'claude-code': 'Claude Code',
    cursor: 'Cursor',
    trae: 'TRAE',
};

/** Команда сброса правил и конфигурации */
export async function resetCommand(packageDir: string, targetDir: string): Promise<void> {
    try {
        resetCommandParamsSchema.parse({ packageDir, targetDir });
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
        console.log(t('command.reset.no-initialized'));

        return;
    }

    let selectedIde: IdeType | 'all' | 'cancel';

    if (initializedIdes.length === 1) {
        [selectedIde] = initializedIdes;
    } else {
        const selectResult = await select<IdeType | 'all' | 'cancel'>({
            message: t('command.reset.select-ide'),
            options: [
                ...initializedIdes.map((ide) => ({
                    label: IDE_LABELS[ide],
                    value: ide,
                })),
                { label: t('command.reset.all'), value: 'all' },
                { label: t('command.reset.cancel'), value: 'cancel' },
            ],
        });

        if (isCancel(selectResult)) {
            return;
        }

        selectedIde = selectResult;
    }

    if (selectedIde === 'cancel') {
        return;
    }

    const idesToReset: IdeType[] = selectedIde === 'all' ? initializedIdes : [selectedIde];

    const confirmMessage =
        idesToReset.length === 1
            ? t('command.reset.confirm-single', { ide: IDE_LABELS[idesToReset[0]] })
            : t('command.reset.confirm-multiple', { count: String(idesToReset.length) });

    const confirmed = await askConfirmation(confirmMessage);

    if (!confirmed) {
        console.log(t('command.reset.cancelled'));

        return;
    }

    for (const ideType of idesToReset) {
        await deleteRulesFromTarget(targetDir, ideType);
        await deleteConfigFile(targetDir, ideType);
        console.log(t('command.reset.success', { ide: IDE_LABELS[ideType] }));
    }

    console.log(t('command.reset.complete'));
}

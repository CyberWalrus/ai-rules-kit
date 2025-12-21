import { cancel, confirm, isCancel, text } from '@clack/prompts';

import {
    getMetaInfoTemplatePath,
    readGlobalRule,
    substituteTemplateVars,
    writeGlobalRule,
} from '../../../lib/cursor-rules';
import { t } from '../../../lib/i18n';
import type { TemplateVariables } from '../../../model';
import { extractVariablesFromContent } from './extract-variables-from-content';
import { promptVariables } from './prompt-variables';

const CANCELLED_MESSAGE_KEY = 'cli.interactive-menu.cancelled';

/** Команда установки глобального правила Cursor */
export async function setGlobalRuleCommand(): Promise<void> {
    const ruleNameInput = await text({
        message: t('command.set-global-rule.prompt.rule-name'),
        placeholder: 'meta-info.md',
    });

    if (isCancel(ruleNameInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const ruleName = ruleNameInput.trim();

    if (ruleName === '') {
        throw new Error(t('command.set-global-rule.error.empty-rule-name'));
    }

    const existingContent = await readGlobalRule(ruleName);
    let existingVariables: Partial<TemplateVariables> = {};

    if (existingContent !== null) {
        existingVariables = extractVariablesFromContent(existingContent);
        const shouldUpdate = await confirm({
            initialValue: true,
            message: t('command.set-global-rule.prompt.update-existing'),
        });

        if (isCancel(shouldUpdate)) {
            cancel(t(CANCELLED_MESSAGE_KEY));

            return;
        }

        if (shouldUpdate === false) {
            cancel(t('command.set-global-rule.cancelled'));

            return;
        }
    }

    const variables = await promptVariables(existingVariables);
    const templatePath = getMetaInfoTemplatePath();
    const substitutedContent = await substituteTemplateVars(templatePath, variables);

    await writeGlobalRule(ruleName, substitutedContent);

    console.log(t('command.set-global-rule.success', { ruleName }));
}

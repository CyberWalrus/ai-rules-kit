import { cancel, isCancel, text } from '@clack/prompts';

import { t } from '../../../lib/i18n';
import type { TemplateVariables } from '../../../model';

const CANCELLED_MESSAGE_KEY = 'cli.interactive-menu.cancelled';

/** Запрашивает значения переменных интерактивно */
export async function promptVariables(existingVariables: Partial<TemplateVariables>): Promise<TemplateVariables> {
    const variables: TemplateVariables = {};

    const currentDate = existingVariables.CURRENT_DATE ?? new Date().toISOString().split('T')[0];
    const currentDateInput = await text({
        initialValue: currentDate,
        message: t('command.set-global-rule.prompt.current-date'),
        placeholder: '2025-12-02',
    });

    if (isCancel(currentDateInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.CURRENT_DATE = currentDateInput;

    const nameInput = await text({
        initialValue: existingVariables.NAME,
        message: t('command.set-global-rule.prompt.name'),
        placeholder: 'John Doe',
    });

    if (isCancel(nameInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.NAME = nameInput;

    const ageInput = await text({
        initialValue: existingVariables.AGE,
        message: t('command.set-global-rule.prompt.age'),
        placeholder: '30',
    });

    if (isCancel(ageInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.AGE = ageInput;

    const roleInput = await text({
        initialValue: existingVariables.ROLE,
        message: t('command.set-global-rule.prompt.role'),
        placeholder: 'Developer',
    });

    if (isCancel(roleInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.ROLE = roleInput;

    const stackInput = await text({
        initialValue: existingVariables.STACK,
        message: t('command.set-global-rule.prompt.stack'),
        placeholder: 'TypeScript, React',
    });

    if (isCancel(stackInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.STACK = stackInput;

    const toolVersionsInput = await text({
        initialValue: existingVariables.TOOL_VERSIONS,
        message: t('command.set-global-rule.prompt.tool-versions'),
        placeholder: 'Node.js v20.19.5',
    });

    if (isCancel(toolVersionsInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.TOOL_VERSIONS = toolVersionsInput;

    const osInput = await text({
        initialValue: existingVariables.OS,
        message: t('command.set-global-rule.prompt.os'),
        placeholder: 'macOS 26.0.1',
    });

    if (isCancel(osInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.OS = osInput;

    const deviceInput = await text({
        initialValue: existingVariables.DEVICE,
        message: t('command.set-global-rule.prompt.device'),
        placeholder: 'MacBook Pro M4 Max',
    });

    if (isCancel(deviceInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.DEVICE = deviceInput;

    const locationInput = await text({
        initialValue: existingVariables.LOCATION,
        message: t('command.set-global-rule.prompt.location'),
        placeholder: 'Moscow, Russia',
    });

    if (isCancel(locationInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.LOCATION = locationInput;

    const languageInput = await text({
        initialValue: existingVariables.LANGUAGE,
        message: t('command.set-global-rule.prompt.language'),
        placeholder: 'Russian (primary), English',
    });

    if (isCancel(languageInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.LANGUAGE = languageInput;

    const communicationStyleInput = await text({
        initialValue: existingVariables.COMMUNICATION_STYLE,
        message: t('command.set-global-rule.prompt.communication-style'),
        placeholder: 'professional, technical',
    });

    if (isCancel(communicationStyleInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));
        process.exit(0);
    }

    variables.COMMUNICATION_STYLE = communicationStyleInput;

    return variables;
}

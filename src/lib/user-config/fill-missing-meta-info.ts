import { cancel, isCancel, log, text } from '@clack/prompts';

import type { UserMetaInfo } from '../../model/types/main';
import { t } from '../i18n';
import type { Translations } from '../i18n/types';

/** Маппинг полей для отображения */
const FIELD_PROMPTS: Record<keyof UserMetaInfo, keyof Translations> = {
    age: 'command.config.meta-info.prompt.age',
    communicationStyle: 'command.config.meta-info.prompt.communication-style',
    device: 'command.config.meta-info.prompt.device',
    language: 'command.config.meta-info.prompt.language',
    location: 'command.config.meta-info.prompt.location',
    name: 'command.config.meta-info.prompt.name',
    os: 'command.config.meta-info.prompt.os',
    role: 'command.config.meta-info.prompt.role',
    stack: 'command.config.meta-info.prompt.stack',
    toolVersions: 'command.config.meta-info.prompt.tool-versions',
};

/** Запрашивает значение для поля возраста */
async function fillAgeField(currentValue: number | undefined): Promise<number | null | undefined> {
    const ageInput = await text({
        initialValue: currentValue ? String(currentValue) : '',
        message: t(FIELD_PROMPTS.age),
    });

    if (isCancel(ageInput)) {
        cancel(t('cli.interactive-menu.cancelled'));

        return null;
    }

    const ageValue = ageInput.trim();

    return ageValue === '' ? undefined : Number.parseInt(ageValue, 10);
}

/** Запрашивает значение для строкового поля */
async function fillStringField(
    field: keyof UserMetaInfo,
    currentValue: string | undefined,
): Promise<string | null | undefined> {
    const fieldInput = await text({
        initialValue: currentValue ?? '',
        message: t(FIELD_PROMPTS[field]),
    });

    if (isCancel(fieldInput)) {
        cancel(t('cli.interactive-menu.cancelled'));

        return null;
    }

    const value = fieldInput.trim();

    return value === '' ? undefined : value;
}

/** Заполняет недостающие обязательные поля метаинформации */
export async function fillMissingMetaInfo(
    currentMetaInfo: UserMetaInfo | null | undefined,
    missingFields: Array<keyof UserMetaInfo>,
): Promise<UserMetaInfo | null> {
    const metaInfo: UserMetaInfo = currentMetaInfo ? { ...currentMetaInfo } : {};

    log.info(t('command.system-files.meta-info.filling-fields'));

    for (const field of missingFields) {
        const currentValue = metaInfo[field];

        if (field === 'age') {
            const ageValue = await fillAgeField(currentValue as number | undefined);

            if (ageValue === null) {
                return null;
            }

            metaInfo.age = ageValue;
        } else {
            const stringValue = await fillStringField(field, currentValue as string | undefined);

            if (stringValue === null) {
                return null;
            }

            metaInfo[field] = stringValue as never;
        }
    }

    log.success(t('command.system-files.meta-info.filled'));

    return metaInfo;
}

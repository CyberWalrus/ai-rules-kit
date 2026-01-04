import { EN_TRANSLATIONS, RU_TRANSLATIONS } from './constants';

/** Получает объект переводов для указанного языка */
export function getTranslations(language: 'en' | 'ru'): Record<keyof typeof EN_TRANSLATIONS, string> {
    return (language === 'ru' ? RU_TRANSLATIONS : EN_TRANSLATIONS) as Record<keyof typeof EN_TRANSLATIONS, string>;
}

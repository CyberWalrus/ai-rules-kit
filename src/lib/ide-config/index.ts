export { ALL_IDES, getInitializedIdes, getUninitializedIdes } from './get-initialized-ides';

/** Тип поддерживаемой IDE */
export type IdeType = 'claude-code' | 'cursor' | 'trae';

/** Возвращает директорию правил для проекта */
export function getProjectIdeDir(ideType: IdeType): string {
    if (ideType === 'cursor') {
        return '.cursor';
    }
    if (ideType === 'trae') {
        return '.trae';
    }
    if (ideType === 'claude-code') {
        return '.claude';
    }

    throw new Error('Unsupported IDE type');
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/** Возвращает директорию правил в исходном архиве */
export function getIdeRulesDir(_ideType: IdeType): string {
    return 'rules-kit';
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/** Возвращает расширение файлов правил для IDE */
export function getIdeFileExtension(ideType: IdeType): '.md' | '.mdc' {
    if (ideType === 'cursor') {
        return '.mdc';
    }
    if (ideType === 'trae') {
        return '.md';
    }
    if (ideType === 'claude-code') {
        return '.md';
    }

    throw new Error('Unsupported IDE type');
}

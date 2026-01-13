/** Тип поддерживаемой IDE */
export type IdeType = 'cursor' | 'trae';

/** Возвращает директорию правил для проекта */
export function getProjectIdeDir(ideType: IdeType): string {
    if (ideType === 'cursor') {
        return '.cursor';
    }
    if (ideType === 'trae') {
        return '.trae';
    }

    throw new Error('Unsupported IDE type');
}

/** Возвращает директорию правил в исходном архиве */
export function getIdeRulesDir(ideType: IdeType): string {
    if (ideType === 'cursor') {
        return 'rules-kit';
    }
    if (ideType === 'trae') {
        return 'rules-kit';
    }

    throw new Error('Unsupported IDE type');
}

/** Возвращает расширение файлов правил для IDE */
export function getIdeFileExtension(ideType: IdeType): '.md' | '.mdc' {
    if (ideType === 'cursor') {
        return '.mdc';
    }
    if (ideType === 'trae') {
        return '.md';
    }

    throw new Error('Unsupported IDE type');
}

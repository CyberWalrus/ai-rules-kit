import matter from 'gray-matter';

/** Результат парсинга YAML frontmatter */
export type ParsedFrontmatter = {
    /** Применять автоматически */
    alwaysApply: boolean;
    /** Идентификатор правила */
    id: string;
    /** Тип правила */
    type: string;
    /** Описание для Claude Code Skills */
    description?: string;
};

/** Парсит YAML frontmatter из .mdc/.md файла */
export function parseRuleFrontmatter(content: string): ParsedFrontmatter | null {
    const parsed = matter(content);

    const { id } = parsed.data;
    if (typeof id !== 'string' || id === '') {
        return null;
    }

    return {
        alwaysApply: Boolean(parsed.data.alwaysApply ?? false),
        description: parsed.data.description === undefined ? undefined : String(parsed.data.description),
        id,
        type: String(parsed.data.type ?? 'unknown'),
    };
}

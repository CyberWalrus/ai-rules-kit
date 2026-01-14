import matter from 'gray-matter';

/**
 * Удаляет поле description из YAML frontmatter для Cursor/TRAE
 * Поле description нужно только для Claude Code Skills
 * @param content - Содержимое файла с YAML frontmatter
 * @returns Содержимое без поля description в frontmatter
 */
export function removeSkillDescription(content: string): string {
    const parsed = matter(content);

    // Удаляем поле description из frontmatter
    const restData = Object.fromEntries(Object.entries(parsed.data).filter(([key]) => key !== 'description'));

    // Если других полей в frontmatter нет, возвращаем контент без frontmatter
    if (Object.keys(restData).length === 0) {
        return parsed.content;
    }

    // Иначе пересобираем frontmatter без description
    return matter.stringify(parsed.content, restData);
}

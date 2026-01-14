import matter from 'gray-matter';

import { parseRuleFrontmatter } from './parse-rule-frontmatter';

/** Результат конвертации в SKILL.md */
export type ConvertedSkill = {
    /** Содержимое файла SKILL.md */
    content: string;
    /** Имя директории для skill */
    dirName: string;
};

/**
 * Преобразует id правила в имя директории для skill (kebab-case)
 */
function getSkillDirName(ruleId: string): string {
    return ruleId
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Конвертирует .mdc/.md правило в формат Claude Code Skill
 * @param ruleContent - Содержимое исходного файла правила
 * @returns Объект с именем директории и содержимым SKILL.md
 */
export function convertToSkillFormat(ruleContent: string): ConvertedSkill | null {
    const parsed = parseRuleFrontmatter(ruleContent);
    if (parsed === null) {
        return null;
    }

    const dirName = getSkillDirName(parsed.id);

    // Извлекаем контент без YAML frontmatter
    const contentOnly = matter(ruleContent).content;

    // Формируем новый YAML frontmatter для Claude Code
    const frontmatter: Record<string, unknown> = {
        description: parsed.description ?? `AI skill for ${parsed.id}`,
        name: dirName,
    };

    // Конвертируем в YAML
    const yamlLines: string[] = ['---'];
    for (const [key, value] of Object.entries(frontmatter)) {
        if (typeof value === 'string') {
            yamlLines.push(`${key}: ${value}`);
        }
    }
    yamlLines.push('---');
    yamlLines.push('');

    // Собираем итоговый файл
    const skillContent = yamlLines.join('\n') + contentOnly;

    return { content: skillContent, dirName };
}

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { parseRuleFrontmatter } from './parse-rule-frontmatter';

/** Правило для всегда применения */
export type AlwaysApplyRule = {
    /** Содержимое файла */
    content: string;
    /** Идентификатор правила */
    id: string;
};

/** Правило для конвертации в Skill */
export type SkillRule = {
    /** Содержимое файла */
    content: string;
    /** Идентификатор правила */
    id: string;
    /** Описание для Claude Code Skills */
    description?: string;
};

/** Результат классификации правил */
export type ClassifiedRules = {
    /** Правила с alwaysApply: true */
    alwaysApplyRules: AlwaysApplyRule[];
    /** Правила с alwaysApply: false (для Skills) */
    skillRules: SkillRule[];
};

/**
 * Разделяет правила на alwaysApply: true и false
 * @param rulesDir - Путь к директории с правилами
 * @returns Объект с двумя массивами правил
 */
export async function classifyRules(rulesDir: string): Promise<ClassifiedRules> {
    const alwaysApplyRules: AlwaysApplyRule[] = [];
    const skillRules: SkillRule[] = [];

    const entries = await readdir(rulesDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const filePath = join(rulesDir, entry.name);
        const content = await readFile(filePath, 'utf8');
        const parsed = parseRuleFrontmatter(content);

        if (parsed === null) {
            continue;
        }

        if (parsed.alwaysApply) {
            alwaysApplyRules.push({ content, id: parsed.id });
        } else {
            skillRules.push({ content, description: parsed.description, id: parsed.id });
        }
    }

    // Сортируем по id для детерминированного порядка
    alwaysApplyRules.sort((a, b) => a.id.localeCompare(b.id));
    skillRules.sort((a, b) => a.id.localeCompare(b.id));

    return { alwaysApplyRules, skillRules };
}

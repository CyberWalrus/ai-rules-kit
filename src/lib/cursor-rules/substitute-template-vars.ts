import { readFile } from 'node:fs/promises';

import type { TemplateVariables } from '../../model';

/** Подставляет переменные в шаблон meta-info.template.md */
export async function substituteTemplateVars(templatePath: string, variables: TemplateVariables): Promise<string> {
    const templateContent = await readFile(templatePath, 'utf-8');

    let result = templateContent;

    Object.entries(variables).forEach(([key, value]) => {
        if (value === null || value === undefined || typeof value !== 'string') {
            return;
        }

        const placeholder = `\${${key}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

        result = result.replace(regex, value);
    });

    return result;
}

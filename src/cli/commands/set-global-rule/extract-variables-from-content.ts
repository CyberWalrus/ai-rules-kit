import type { TemplateVariables } from '../../../model';

/** Извлекает значения переменных из существующего файла правила */
export function extractVariablesFromContent(content: string): Partial<TemplateVariables> {
    const variables: Partial<TemplateVariables> = {};
    const variableKeys: Array<keyof TemplateVariables> = [
        'CURRENT_DATE',
        'NAME',
        'AGE',
        'ROLE',
        'STACK',
        'TOOL_VERSIONS',
        'OS',
        'DEVICE',
        'LOCATION',
        'LANGUAGE',
        'COMMUNICATION_STYLE',
    ];

    variableKeys.forEach((key) => {
        const keyString = String(key);
        const regex = new RegExp(`\\$\\{${keyString}\\}`, 'g');
        if (!regex.test(content)) {
            const valueRegex = new RegExp(
                `- ${keyString === 'CURRENT_DATE' ? 'current_date' : keyString.toLowerCase()}: "?([^"\\n]+)"?`,
                'i',
            );
            const match = content.match(valueRegex);
            if (match && match[1]) {
                variables[key] = match[1].trim();
            } else {
                const inlineRegex = new RegExp(
                    `${keyString === 'CURRENT_DATE' ? 'CURRENT DATE' : keyString.replace(/_/g, ' ')}: ([^\\n]+)`,
                    'i',
                );
                const inlineMatch = content.match(inlineRegex);
                if (inlineMatch && inlineMatch[1]) {
                    variables[key] = inlineMatch[1].trim();
                }
            }
        }
    });

    return variables;
}

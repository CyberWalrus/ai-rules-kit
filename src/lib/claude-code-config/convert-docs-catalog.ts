import { CLAUDE_DOCS_DIR_PLACEHOLDER, DOCS_DIR_PLACEHOLDER } from '../../model';

/**
 * Конвертирует rules-catalog.md в docs-catalog.md
 * Убирает секции Rules Files и Commands Files, оставляет только Docs Files
 * @param catalogContent - Содержимое rules-catalog.md
 * @returns Содержимое docs-catalog.md
 */
export function convertDocsCatalog(catalogContent: string): string {
    const lines = catalogContent.split('\n');
    const result: string[] = [];

    let inRulesSection = false;
    let inCommandsSection = false;

    for (const line of lines) {
        // Проверяем на начало секции Rules Files
        if (line.includes('### Rules Files')) {
            inRulesSection = true;
            continue;
        }

        // Проверяем на начало секции Commands Files
        if (line.includes('### Commands Files')) {
            inRulesSection = false;
            inCommandsSection = true;
            continue;
        }

        // Проверяем на начало секции Docs Files
        if (line.includes('### Docs Files')) {
            inCommandsSection = false;
            // Меняем заголовок
            result.push('### Claude Code Docs Files');
            continue;
        }

        // Пропускаем строки внутри секций Rules и Commands
        if (inRulesSection || inCommandsSection) {
            continue;
        }

        // Заменяем плейсхолдеры
        let processedLine = line
            .replaceAll(DOCS_DIR_PLACEHOLDER, CLAUDE_DOCS_DIR_PLACEHOLDER)
            .replaceAll('{{RULES_DIR}}/', `${CLAUDE_DOCS_DIR_PLACEHOLDER}/`)
            .replaceAll('{{RULES_DIR}}', CLAUDE_DOCS_DIR_PLACEHOLDER);

        // Обновляем заголовок файла
        if (line.includes('# Cursor Rules и Docs Справочник')) {
            processedLine = '# Claude Code Docs Справочник';
        }

        // Обновляем описание пути к текущему файлу
        if (line.includes('(current file)')) {
            processedLine = processedLine.replace('rules-catalog.md', 'docs-catalog.md');
        }

        result.push(processedLine);
    }

    return result.join('\n');
}

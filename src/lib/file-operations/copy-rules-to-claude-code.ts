import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { McpConfig } from '../../model';
import { CLAUDE_DOCS_CATALOG_FILE_NAME, CLAUDE_SKILL_FILE_NAME, SYSTEM_RULES_DIR } from '../../model';
import {
    classifyRules,
    convertDocsCatalog,
    convertMcpToSettingsJson,
    convertToSkillFormat,
    generateClaudeMainFile,
    generateClaudeRulesBlock,
    getClaudeCommandsDir,
    getClaudeDocsDir,
    getClaudeMainFileName,
    getClaudeSettingsPath,
    getClaudeSkillsDir,
} from '../claude-code-config';
import { isEmptyString } from '../helpers';
import { pathExists } from './path-exists';
import { replacePlaceholders } from './replace-placeholders';
import { shouldIgnoreFile } from './should-ignore-file';

/**
 * Копирует команды из source в .claude/commands
 * Не перезаписывает существующие команды
 */
async function copyCommandsToClaude(packageDir: string, targetDir: string, ignoreList: string[]): Promise<void> {
    const sourceCommandsDir = join(packageDir, 'rules-kit', 'commands');
    const sourceExists = await pathExists(sourceCommandsDir);

    if (!sourceExists) {
        return;
    }

    const targetCommandsDir = join(targetDir, getClaudeCommandsDir());
    await mkdir(targetCommandsDir, { recursive: true });

    const entries = await readdir(sourceCommandsDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const relativePath = `commands/${entry.name}`;
        if (shouldIgnoreFile(relativePath, ignoreList)) {
            continue;
        }

        const sourcePath = join(sourceCommandsDir, entry.name);
        const targetPath = join(targetCommandsDir, entry.name);

        // Пропускаем команду, если она уже существует (чтобы не перезаписывать пользовательские команды)
        const targetExists = await pathExists(targetPath);
        if (targetExists) {
            continue;
        }

        const content = await readFile(sourcePath, 'utf-8');
        const processedContent = replacePlaceholders(content, 'claude-code');
        await writeFile(targetPath, processedContent, 'utf-8');
    }
}

/**
 * Копирует и конвертирует документы из source в .claude/docs
 * Не перезаписывает существующие файлы (кроме docs-catalog.md)
 */
async function copyDocsToClaude(packageDir: string, targetDir: string, ignoreList: string[]): Promise<string> {
    const sourceDocsDir = join(packageDir, 'rules-kit', 'docs');
    const sourceExists = await pathExists(sourceDocsDir);

    if (!sourceExists) {
        return '';
    }

    const targetDocsDir = join(targetDir, getClaudeDocsDir());
    await mkdir(targetDocsDir, { recursive: true });

    const entries = await readdir(sourceDocsDir, { withFileTypes: true });
    let docsCatalogContent = '';

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const relativePath = `docs/${String(entry.name)}`;
        if (shouldIgnoreFile(relativePath, ignoreList)) {
            continue;
        }

        const sourcePath = join(sourceDocsDir, String(entry.name));

        const content = await readFile(sourcePath, 'utf-8');

        // Конвертируем rules-catalog.md в docs-catalog.md
        if (entry.name === 'rules-catalog.md') {
            docsCatalogContent = convertDocsCatalog(content);
            const catalogPath = join(targetDocsDir, CLAUDE_DOCS_CATALOG_FILE_NAME);
            const processedContent = replacePlaceholders(docsCatalogContent, 'claude-code');
            await writeFile(catalogPath, processedContent, 'utf-8');
        } else {
            // Пропускаем файл, если он уже существует (чтобы не перезаписывать пользовательские файлы)
            const targetPath = join(targetDocsDir, String(entry.name));
            const targetExists = await pathExists(targetPath);
            if (!targetExists) {
                const processedContent = replacePlaceholders(content, 'claude-code');
                await writeFile(targetPath, processedContent, 'utf-8');
            }
        }
    }

    return docsCatalogContent;
}

/**
 * Создаёт Skills для alwaysApply: false правил
 */
async function createSkillsFromRules(rulesDir: string, targetDir: string): Promise<void> {
    const { skillRules } = await classifyRules(rulesDir);

    for (const rule of skillRules) {
        const converted = convertToSkillFormat(rule.content);
        if (converted === null) {
            continue;
        }

        const skillDir = join(targetDir, getClaudeSkillsDir(), converted.dirName);
        await mkdir(skillDir, { recursive: true });

        const skillPath = join(skillDir, CLAUDE_SKILL_FILE_NAME);
        const processedContent = replacePlaceholders(converted.content, 'claude-code');
        await writeFile(skillPath, processedContent, 'utf-8');
    }
}

/**
 * Глубоко объединяет два объекта
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
    if (typeof target !== 'object' || target === null) {
        return source as T;
    }
    if (typeof source !== 'object' || source === null) {
        return target;
    }

    const result = { ...target };

    Object.keys(source as Record<string, unknown>).forEach((key) => {
        const sourceValue = (source as Record<string, unknown>)[key];
        const targetValue = (result as Record<string, unknown>)[key];

        if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
            (result as Record<string, unknown>)[key] = deepMerge(
                targetValue as Record<string, unknown>,
                sourceValue as Record<string, unknown>,
            );
        } else {
            (result as Record<string, unknown>)[key] = sourceValue;
        }
    });

    return result;
}

/**
 * Конвертирует mcp.json в .claude/settings.json, сохраняя существующие настройки
 */
async function convertMcpSettings(packageDir: string, targetDir: string): Promise<void> {
    const sourceMcpPath = join(packageDir, SYSTEM_RULES_DIR, 'mcp.json');
    const sourceExists = await pathExists(sourceMcpPath);

    let mcpServers: Record<string, unknown> = {};

    if (sourceExists) {
        const mcpContent = await readFile(sourceMcpPath, 'utf-8');
        const mcpConfig = JSON.parse(mcpContent) as McpConfig;
        const newSettingsJson = convertMcpToSettingsJson(mcpConfig);
        const newSettings = JSON.parse(newSettingsJson) as { mcpServers?: Record<string, unknown> };
        mcpServers = newSettings.mcpServers ?? {};
    }

    const targetSettingsPath = join(targetDir, getClaudeSettingsPath());
    const targetExists = await pathExists(targetSettingsPath);

    let existingSettings: Record<string, unknown> = {};

    if (targetExists) {
        const existingContent = await readFile(targetSettingsPath, 'utf-8');
        try {
            existingSettings = JSON.parse(existingContent) as Record<string, unknown>;
        } catch {
            // Если файл не валидный JSON, начинаем с пустого объекта
            existingSettings = {};
        }
    }

    // Объединяем mcpServers
    const mergedSettings = deepMerge(existingSettings, { mcpServers });

    await mkdir(join(targetDir, '.claude'), { recursive: true });
    await writeFile(targetSettingsPath, `${JSON.stringify(mergedSettings, null, 2)}\n`, 'utf-8');
}

/** Константы для поиска блока правил в CLAUDE.md */
export const BLOCK_START_TAG = '<!-- CLAUDE-RULES-START -->';
export const BLOCK_END_TAG = '<!-- CLAUDE-RULES-END -->';

/**
 * Обновляет блок правил в существующем CLAUDE.md
 * @param claudeMdPath - Путь к файлу CLAUDE.md
 * @param newBlock - Новый блок правил для вставки
 */
export async function updateClaudeRulesBlock(claudeMdPath: string, newBlock: string): Promise<void> {
    const existingContent = await readFile(claudeMdPath, 'utf-8');

    const startIndex = existingContent.indexOf(BLOCK_START_TAG);
    const endIndex = existingContent.indexOf(BLOCK_END_TAG);

    if (startIndex === -1 || endIndex === -1) {
        // Теги не найдены - добавляем блок в конец файла
        const updatedContent = `${existingContent.trimEnd()}\n\n${newBlock}\n`;
        await writeFile(claudeMdPath, updatedContent, 'utf-8');

        return;
    }

    // Заменяем блок между тегами
    const before = existingContent.slice(0, startIndex);
    const after = existingContent.slice(endIndex + BLOCK_END_TAG.length);

    const updatedContent = before + newBlock + after;
    await writeFile(claudeMdPath, updatedContent, 'utf-8');
}

/**
 * Копирует правила для Claude Code со специальной обработкой
 * @param packageDir - Директория с исходными правилами
 * @param targetDir - Целевая директория проекта
 * @param ignoreList - Список файлов для игнорирования
 * @param updateExisting - Обновлять блок в существующем CLAUDE.md
 */
export async function copyRulesToClaudeCode(
    packageDir: string,
    targetDir: string,
    ignoreList: string[] = [],
    updateExisting = false,
): Promise<void> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const rulesDir = join(packageDir, 'rules-kit', 'rules');
    const rulesExist = await pathExists(rulesDir);

    if (!rulesExist) {
        return;
    }

    // 1. Классифицируем правила
    const { alwaysApplyRules } = await classifyRules(rulesDir);

    // 2. Копируем и конвертируем документы, получаем docs-catalog
    const docsCatalogContent = await copyDocsToClaude(packageDir, targetDir, ignoreList);

    // 3. Генерируем CLAUDE.md в корне проекта
    const claudeMdPath = join(targetDir, getClaudeMainFileName());

    if (updateExisting) {
        // Режим обновления существующего файла
        const rulesBlock = generateClaudeRulesBlock(alwaysApplyRules, docsCatalogContent);
        await updateClaudeRulesBlock(claudeMdPath, rulesBlock);
    } else {
        // Стандартный режим - создаём новый файл
        const claudeMdContent = generateClaudeMainFile(alwaysApplyRules, docsCatalogContent);
        await writeFile(claudeMdPath, claudeMdContent, 'utf-8');
    }

    // 4. Создаём Skills для alwaysApply: false правил
    await createSkillsFromRules(rulesDir, targetDir);

    // 5. Копируем команды
    await copyCommandsToClaude(packageDir, targetDir, ignoreList);

    // 6. Конвертируем MCP настройки
    await convertMcpSettings(packageDir, targetDir);
}

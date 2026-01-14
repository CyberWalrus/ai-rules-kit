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
        const content = await readFile(sourcePath, 'utf-8');
        const processedContent = replacePlaceholders(content, 'claude-code');
        await writeFile(targetPath, processedContent, 'utf-8');
    }
}

/**
 * Копирует и конвертирует документы из source в .claude/docs
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
        const targetPath = join(targetDocsDir, String(entry.name));

        const content = await readFile(sourcePath, 'utf-8');

        // Конвертируем rules-catalog.md в docs-catalog.md
        if (entry.name === 'rules-catalog.md') {
            docsCatalogContent = convertDocsCatalog(content);
            const catalogPath = join(targetDocsDir, CLAUDE_DOCS_CATALOG_FILE_NAME);
            const processedContent = replacePlaceholders(docsCatalogContent, 'claude-code');
            await writeFile(catalogPath, processedContent, 'utf-8');
        } else {
            const processedContent = replacePlaceholders(content, 'claude-code');
            await writeFile(targetPath, processedContent, 'utf-8');
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
 * Конвертирует mcp.json в .claude/settings.json
 */
async function convertMcpSettings(packageDir: string, targetDir: string): Promise<void> {
    const sourceMcpPath = join(packageDir, SYSTEM_RULES_DIR, 'mcp.json');
    const sourceExists = await pathExists(sourceMcpPath);

    let settingsJson = '{\n  "mcpServers": {}\n}';

    if (sourceExists) {
        const mcpContent = await readFile(sourceMcpPath, 'utf-8');
        const mcpConfig = JSON.parse(mcpContent) as McpConfig;
        settingsJson = convertMcpToSettingsJson(mcpConfig);
    }

    const targetSettingsPath = join(targetDir, getClaudeSettingsPath());
    await mkdir(join(targetDir, '.claude'), { recursive: true });
    await writeFile(targetSettingsPath, settingsJson, 'utf-8');
}

/**
 * Копирует правила для Claude Code со специальной обработкой
 * @param packageDir - Директория с исходными правилами
 * @param targetDir - Целевая директория проекта
 * @param ignoreList - Список файлов для игнорирования
 */
export async function copyRulesToClaudeCode(
    packageDir: string,
    targetDir: string,
    ignoreList: string[] = [],
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
    const claudeMdContent = generateClaudeMainFile(alwaysApplyRules, docsCatalogContent);
    const claudeMdPath = join(targetDir, getClaudeMainFileName());
    await writeFile(claudeMdPath, claudeMdContent, 'utf-8');

    // 4. Создаём Skills для alwaysApply: false правил
    await createSkillsFromRules(rulesDir, targetDir);

    // 5. Копируем команды
    await copyCommandsToClaude(packageDir, targetDir, ignoreList);

    // 6. Конвертируем MCP настройки
    await convertMcpSettings(packageDir, targetDir);
}

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

import type { FileOverride } from '../../model';
import { RULES_DIRS } from '../../model';
import { isEmptyString } from '../helpers';
import type { IdeType } from '../ide-config';
import { getIdeFileExtension, getProjectIdeDir } from '../ide-config';
import { applyYamlOverrides } from './apply-yaml-overrides';
import { copyRulesToClaudeCode } from './copy-rules-to-claude-code';
import { pathExists } from './path-exists';
import { replacePlaceholders } from './replace-placeholders';
import { shouldIgnoreFile } from './should-ignore-file';

/** Копирует файл из источника в цель с конвертацией расширения и заменой плейсхолдеров */
async function copyFileWithConversion(
    sourcePath: string,
    targetPath: string,
    ideType: IdeType,
    relativePath: string,
): Promise<void> {
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
        return;
    }

    const targetDir = dirname(targetPath);
    await mkdir(targetDir, { recursive: true });

    const targetExtension = getIdeFileExtension(ideType);
    const sourceExtension = sourcePath.endsWith('.mdc') ? '.mdc' : '.md';

    // Конвертируем расширение только для файлов в rules/ директории
    const isInRulesDir = relativePath.startsWith('rules/');

    let finalTargetPath = targetPath;

    if (isInRulesDir) {
        if (sourceExtension === '.mdc' && targetExtension === '.md') {
            finalTargetPath = targetPath.replace(/\.mdc$/, '.md');
        } else if (sourceExtension === '.md' && targetExtension === '.mdc') {
            finalTargetPath = targetPath.replace(/\.md$/, '.mdc');
        }
    }

    const content = await readFile(sourcePath, 'utf-8');
    const processedContent = replacePlaceholders(content, ideType);
    await writeFile(finalTargetPath, processedContent, 'utf-8');
}

/** Рекурсивно копирует файлы из директории с конвертацией */
async function copyDirectoryRecursive(
    sourceDir: string,
    targetDir: string,
    baseDir: string,
    ignoreList: string[],
    ideType: IdeType,
): Promise<void> {
    const hasNegationPatterns = ignoreList.some((pattern) => pattern.startsWith('!'));
    await mkdir(targetDir, { recursive: true });

    const entries = await readdir(sourceDir, { withFileTypes: true });

    await Promise.all(
        entries.map(async (entry) => {
            const sourcePath = join(sourceDir, entry.name);
            const relativePath = relative(baseDir, sourcePath).replace(/\\/g, '/');
            const targetPath = join(targetDir, entry.name);
            const shouldIgnore = shouldIgnoreFile(relativePath, ignoreList);

            if (entry.isDirectory()) {
                if (!shouldIgnore || hasNegationPatterns) {
                    await copyDirectoryRecursive(sourcePath, targetPath, baseDir, ignoreList, ideType);
                }
            } else if (entry.isFile() && !shouldIgnore) {
                await copyFileWithConversion(sourcePath, targetPath, ideType, relativePath);
            }
        }),
    );
}

/** Копирует правила из пакета в целевую директорию */
export async function copyRulesToTarget(
    packageDir: string,
    targetDir: string,
    ideType: IdeType,
    ignoreList: string[] = [],
    fileOverrides: FileOverride[] = [],
    sourceDirPrefix: string = '',
): Promise<void> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    // Для Claude Code используем специализированную логику
    if (ideType === 'claude-code') {
        await copyRulesToClaudeCode(packageDir, targetDir, ignoreList);

        return;
    }

    const ideDir = getProjectIdeDir(ideType);
    const targetIdeDir = join(targetDir, ideDir);

    const hasNegationPatterns = ignoreList.some((pattern) => pattern.startsWith('!'));

    await Promise.all(
        RULES_DIRS.map(async (ruleDir) => {
            const sourcePath = join(packageDir, sourceDirPrefix, ruleDir);
            const targetPath = join(targetIdeDir, ruleDir);
            const sourceExists = await pathExists(sourcePath);

            if (!sourceExists) {
                return;
            }

            const baseDir = join(packageDir, sourceDirPrefix);
            const relativeRuleDir = relative(baseDir, sourcePath).replace(/\\/g, '/');
            const shouldIgnoreDir = shouldIgnoreFile(relativeRuleDir, ignoreList);

            if (!shouldIgnoreDir || hasNegationPatterns) {
                await copyDirectoryRecursive(sourcePath, targetPath, baseDir, ignoreList, ideType);
            }
        }),
    );

    await Promise.all(
        fileOverrides.map(async (override) => {
            const overridePath = join(targetIdeDir, override.file);
            const overrideExists = await pathExists(overridePath);

            if (overrideExists) {
                await applyYamlOverrides(overridePath, override.yamlOverrides);
            }
        }),
    );
}

import { cp, mkdir, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

import type { FileOverride } from '../../model';
import { RULES_DIRS } from '../../model';
import { isEmptyString } from '../helpers';
import { applyYamlOverrides } from './apply-yaml-overrides';
import { pathExists } from './path-exists';
import { shouldIgnoreFile } from './should-ignore-file';

/** Копирует файл из источника в цель */
async function copyFile(sourcePath: string, targetPath: string): Promise<void> {
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
        return;
    }

    const targetDir = dirname(targetPath);

    await mkdir(targetDir, { recursive: true });
    await cp(sourcePath, targetPath, { force: true });
}

/** Рекурсивно копирует файлы из директории */
async function copyDirectoryRecursive(
    sourceDir: string,
    targetDir: string,
    baseDir: string,
    ignoreList: string[],
): Promise<void> {
    const entries = await readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = join(sourceDir, entry.name);
        const relativePath = relative(baseDir, sourcePath).replace(/\\/g, '/');
        const targetPath = join(targetDir, entry.name);

        if (entry.isDirectory()) {
            if (!shouldIgnoreFile(relativePath, ignoreList)) {
                await copyDirectoryRecursive(sourcePath, targetPath, baseDir, ignoreList);
            }
        } else if (entry.isFile() && !shouldIgnoreFile(relativePath, ignoreList)) {
            await copyFile(sourcePath, targetPath);
        }
    }
}

/** Копирует правила из пакета в целевую директорию */
export async function copyRulesToTarget(
    packageDir: string,
    targetDir: string,
    ignoreList: string[] = [],
    fileOverrides: FileOverride[] = [],
): Promise<void> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    await Promise.all(
        RULES_DIRS.map(async (ruleDir) => {
            const sourcePath = join(packageDir, ruleDir);
            const targetPath = join(targetDir, ruleDir);
            const sourceExists = await pathExists(sourcePath);

            if (!sourceExists) {
                return;
            }

            const baseDir = join(packageDir, '.cursor');
            const relativeRuleDir = relative(baseDir, sourcePath).replace(/\\/g, '/');

            if (!shouldIgnoreFile(relativeRuleDir, ignoreList)) {
                await copyDirectoryRecursive(sourcePath, targetPath, baseDir, ignoreList);
            }
        }),
    );

    await Promise.all(
        fileOverrides.map(async (override) => {
            const overridePath = join(targetDir, '.cursor', override.file);
            const overrideExists = await pathExists(overridePath);

            if (overrideExists) {
                await applyYamlOverrides(overridePath, override.yamlOverrides);
            }
        }),
    );
}

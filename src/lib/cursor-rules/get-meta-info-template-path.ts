import { join } from 'node:path';

/** Получает путь к шаблону meta-info.template.md */
export function getMetaInfoTemplatePath(): string {
    const packageDir = process.cwd();

    return join(packageDir, 'user-rules', 'meta-info.template.md');
}

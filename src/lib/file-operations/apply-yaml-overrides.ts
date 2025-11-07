import matter from 'gray-matter';
import { readFile, writeFile } from 'node:fs/promises';

/** Применяет переопределения YAML frontmatter к файлу */
export async function applyYamlOverrides(filePath: string, yamlOverrides: Record<string, unknown>): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const parsed = matter(content);

    const mergedData = {
        ...parsed.data,
        ...yamlOverrides,
    };

    const newContent = matter.stringify(parsed.content, mergedData);

    await writeFile(filePath, newContent, 'utf-8');
}

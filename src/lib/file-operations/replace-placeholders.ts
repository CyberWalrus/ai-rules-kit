import {
    COMMANDS_DIR_PLACEHOLDER,
    DOCS_DIR_PLACEHOLDER,
    FILE_EXT_PLACEHOLDER,
    IDE_DIR_PLACEHOLDER,
    RULES_DIR_PLACEHOLDER,
} from '../../model';
import type { IdeType } from '../ide-config';
import { getIdeFileExtension, getProjectIdeDir } from '../ide-config';

/** Заменяет плейсхолдеры в содержимом на значения для конкретной IDE */
export function replacePlaceholders(content: string | undefined, ideType: IdeType): string {
    if (content === undefined) {
        return '';
    }

    const ideDir = getProjectIdeDir(ideType);
    const fileExt = getIdeFileExtension(ideType);
    const rulesDir = `${ideDir}/rules`;
    const docsDir = `${ideDir}/docs`;
    const commandsDir = `${ideDir}/commands`;

    let result = content;
    result = result.replaceAll(IDE_DIR_PLACEHOLDER, ideDir);
    result = result.replaceAll(FILE_EXT_PLACEHOLDER, fileExt);
    result = result.replaceAll(RULES_DIR_PLACEHOLDER, rulesDir);
    result = result.replaceAll(DOCS_DIR_PLACEHOLDER, docsDir);
    result = result.replaceAll(COMMANDS_DIR_PLACEHOLDER, commandsDir);

    return result;
}

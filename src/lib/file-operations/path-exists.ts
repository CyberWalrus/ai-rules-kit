import { access, constants } from 'node:fs/promises';

import { isEmptyString } from '../helpers';

/** Проверяет существование файла или директории */
export async function pathExists(path: string): Promise<boolean> {
    if (isEmptyString(path)) {
        return false;
    }

    try {
        await access(path, constants.F_OK);

        return true;
    } catch {
        return false;
    }
}

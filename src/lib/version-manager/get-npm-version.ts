import { NPM_REGISTRY_URL, NPM_REQUEST_TIMEOUT } from '../../model/constants/main';
import { isEmptyString } from '../helpers';

/** Получает последнюю версию пакета из npm registry */
export async function getNpmVersion(packageName: string): Promise<string> {
    if (isEmptyString(packageName)) {
        throw new Error('packageName is required');
    }

    const url = `${NPM_REGISTRY_URL}/${packageName}/latest`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, NPM_REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to fetch package version: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { version: string };

        if (isEmptyString(data.version)) {
            throw new Error('Invalid version format in npm registry response');
        }

        return data.version;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout: npm registry did not respond in time');
        }

        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get npm version: ${message}`);
    }
}

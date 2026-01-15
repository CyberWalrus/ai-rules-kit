import { SYSTEM_RULES_TAG_PREFIX } from '../../model';
import { t } from '../i18n';
import { getGithubToken } from '../user-config';

/** Получает последнюю версию системных правил из GitHub репозитория. Возвращает null при сетевых ошибках */
export async function getLatestSystemRulesVersion(repo: string): Promise<string | null> {
    if (repo === null || repo === undefined) {
        throw new Error('repo is required');
    }

    const token = await getGithubToken();
    const headers: Record<string, string> = {
        'User-Agent': 'ai-rules-kit',
        ...(token !== undefined && { Authorization: `Bearer ${token}` }),
    };

    let response: Response;

    try {
        response = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=100`, {
            headers,
        });
    } catch (error: unknown) {
        const message: string = error instanceof Error ? error.message : String(error);
        console.warn(t('github-fetcher.fetch-failed', { message }));

        return null;
    }

    if (!response.ok) {
        if (response.status === 403) {
            const message =
                token === undefined
                    ? 'GitHub API error: 403 Forbidden. Set GITHUB_TOKEN environment variable to increase rate limit (60 req/hour per IP address without token).'
                    : 'GitHub API error: 403 Forbidden. Check if GITHUB_TOKEN is valid and has required permissions.';
            console.warn(`⚠️ ${message}`);

            return null;
        }
        console.warn(t('github-fetcher.api-error', { status: String(response.status) }));

        return null;
    }

    let tags: Array<{ name: string }>;

    try {
        tags = (await response.json()) as Array<{ name: string }>;
    } catch (error: unknown) {
        const message: string = error instanceof Error ? error.message : String(error);
        console.warn(t('github-fetcher.parse-error', { message }));

        return null;
    }

    const systemRulesTags = tags.filter((tag) => tag.name.startsWith(SYSTEM_RULES_TAG_PREFIX));

    if (systemRulesTags.length === 0) {
        console.warn(t('github-fetcher.no-version'));

        return null;
    }

    const sortedTags = systemRulesTags.sort((a, b) => {
        const versionA = a.name.replace(SYSTEM_RULES_TAG_PREFIX, '');
        const versionB = b.name.replace(SYSTEM_RULES_TAG_PREFIX, '');

        return versionB.localeCompare(versionA, undefined, { numeric: true, sensitivity: 'base' });
    });

    const latestTag = sortedTags[0];

    return latestTag.name.replace(SYSTEM_RULES_TAG_PREFIX, '');
}

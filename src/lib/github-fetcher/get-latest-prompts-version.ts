/** Получает последнюю версию промптов из GitHub репозитория. Возвращает null при сетевых ошибках */
export async function getLatestPromptsVersion(repo: string): Promise<string | null> {
    if (repo === null || repo === undefined) {
        throw new Error('repo is required');
    }

    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
        'User-Agent': 'cursor-rules-cli',
        ...(token !== undefined && { Authorization: `Bearer ${token}` }),
    };

    let response: Response;

    try {
        response = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=100`, {
            headers,
        });
    } catch (error: unknown) {
        const message: string = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Failed to fetch latest prompts version from GitHub: ${message}`);

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
        console.warn(`⚠️ GitHub API error: ${response.status}`);

        return null;
    }

    let tags: Array<{ name: string }>;

    try {
        tags = (await response.json()) as Array<{ name: string }>;
    } catch (error: unknown) {
        const message: string = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Failed to parse GitHub API response: ${message}`);

        return null;
    }

    const promptTags = tags.filter((t) => t.name.startsWith('prompts/v'));

    if (promptTags.length === 0) {
        console.warn('⚠️ No prompts version found in GitHub repository');

        return null;
    }

    const sortedTags = promptTags.sort((a, b) => {
        const versionA = a.name.replace('prompts/v', '');
        const versionB = b.name.replace('prompts/v', '');

        return versionB.localeCompare(versionA, undefined, { numeric: true, sensitivity: 'base' });
    });

    const latestTag = sortedTags[0];

    return latestTag.name.replace('prompts/v', '');
}

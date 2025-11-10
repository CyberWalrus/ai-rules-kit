export async function getLatestPromptsVersion(repo: string): Promise<string> {
    const response = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=100`, {
        headers: { 'User-Agent': 'cursor-rules-cli' },
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const tags = (await response.json()) as Array<{ name: string }>;
    const promptTags = tags.filter((t) => t.name.startsWith('prompts/v'));

    if (promptTags.length === 0) {
        throw new Error('No prompts version found');
    }

    const latestTag = promptTags[0];

    return latestTag.name.replace('prompts/v', '');
}

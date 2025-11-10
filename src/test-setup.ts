/* eslint-disable import/no-extraneous-dependencies */
import { beforeEach, vi } from 'vitest';

let copyRulesFixtures: ((targetDir: string) => Promise<void>) | undefined;

if (process.env.TEST_TYPE === 'e2e') {
    const fixtures = await import('./__tests__/e2e/helpers/copy-rules-fixtures');
    copyRulesFixtures = fixtures.copyRulesFixtures;

    vi.mock('./lib/github-fetcher', () => ({
        fetchPromptsTarball: vi.fn().mockImplementation(async (_repo: string, _version: string, targetDir: string) => {
            if (copyRulesFixtures) {
                await copyRulesFixtures(targetDir);
            }
        }),
        getLatestPromptsVersion: vi.fn().mockResolvedValue('2025.11.10.1'),
    }));
}

beforeEach(() => {
    vi.clearAllMocks();
});

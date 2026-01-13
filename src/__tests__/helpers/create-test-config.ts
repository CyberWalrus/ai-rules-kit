import type { RulesConfig } from '../../model';

export function createTestConfig(overrides: Partial<RulesConfig> = {}): RulesConfig {
    const defaultConfig: RulesConfig = {
        cliVersion: '1.0.0',
        configVersion: '1.0.0',
        fileOverrides: [],
        ideType: 'cursor',
        ignoreList: [],
        installedAt: '2025-11-01T12:00:00.000Z',
        promptsVersion: '2025.11.10.1',
        ruleSets: [
            {
                id: 'base',
                update: true,
            },
        ],
        settings: {
            language: 'ru',
        },
        source: 'ai-rules-kit',
        systemRulesVersion: undefined,
        updatedAt: '2025-11-01T12:00:00.000Z',
    };

    return { ...defaultConfig, ...overrides };
}

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { classifyRules } from '../classify-rules';

// Моки для файловой системы
vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
    readdir: vi.fn(),
}));

describe('classifyRules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен возвращать пустые массивы для пустой директории', async () => {
        const { readdir } = await import('node:fs/promises');
        vi.mocked(readdir).mockResolvedValue([]);

        const result = await classifyRules('/fake/path');

        expect(result.alwaysApplyRules).toEqual([]);
        expect(result.skillRules).toEqual([]);
    });

    it('должен классифицировать alwaysApply: true правила', async () => {
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');

        vi.mocked(readdir).mockResolvedValue([{ isFile: () => true, name: 'file1.md' }] as never);
        vi.mocked(readFile).mockResolvedValue(`---
id: rule1
alwaysApply: true
---
# Rule 1`);

        const result = await classifyRules('/fake/path');

        expect(result.alwaysApplyRules).toHaveLength(1);
        expect(result.alwaysApplyRules[0].id).toBe('rule1');
        expect(result.skillRules).toHaveLength(0);
    });

    it('должен классифицировать alwaysApply: false правила', async () => {
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');

        vi.mocked(readdir).mockResolvedValue([{ isFile: () => true, name: 'file1.md' }] as never);
        vi.mocked(readFile).mockResolvedValue(`---
id: skill1
alwaysApply: false
description: Test skill
---
# Skill 1`);

        const result = await classifyRules('/fake/path');

        expect(result.alwaysApplyRules).toHaveLength(0);
        expect(result.skillRules).toHaveLength(1);
        expect(result.skillRules[0].id).toBe('skill1');
    });

    it('должен сортировать правила по id', async () => {
        const { readdir } = await import('node:fs/promises');
        const { readFile } = await import('node:fs/promises');

        vi.mocked(readdir).mockResolvedValue([
            { isFile: () => true, name: 'z-rule.mdc' },
            { isFile: () => true, name: 'a-rule.mdc' },
        ] as never);
        vi.mocked(readFile).mockResolvedValueOnce(`---
id: z-rule
alwaysApply: true
---
# Z`).mockResolvedValueOnce(`---
id: a-rule
alwaysApply: true
---
# A`);

        const result = await classifyRules('/fake/path');

        expect(result.alwaysApplyRules).toHaveLength(2);
        expect(result.alwaysApplyRules[0].id).toBe('a-rule');
        expect(result.alwaysApplyRules[1].id).toBe('z-rule');
    });
});

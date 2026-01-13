import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { FileOverride } from '../../../model';
import { RULES_DIRS } from '../../../model';
import { copyRulesToTarget } from '../copy-rules-to-target';

function getTestPath(...segments: string[]): string {
    return join(tmpdir(), 'cursor-rules-test', ...segments);
}

const { mockCp, mockMkdir, mockPathExists, mockReaddir, mockApplyYamlOverrides, mockShouldIgnoreFile } = vi.hoisted(
    () => ({
        mockApplyYamlOverrides: vi.fn(),
        mockCp: vi.fn(),
        mockMkdir: vi.fn(),
        mockPathExists: vi.fn(),
        mockReaddir: vi.fn(),
        mockShouldIgnoreFile: vi.fn(),
    }),
);

vi.mock('node:fs/promises', () => ({
    cp: mockCp,
    mkdir: mockMkdir,
    readdir: mockReaddir,
}));

vi.mock('../path-exists', () => ({
    pathExists: mockPathExists,
}));

vi.mock('../apply-yaml-overrides', () => ({
    applyYamlOverrides: mockApplyYamlOverrides,
}));

vi.mock('../should-ignore-file', () => ({
    shouldIgnoreFile: mockShouldIgnoreFile,
}));

describe('copyRulesToTarget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockShouldIgnoreFile.mockReturnValue(false);
        mockPathExists.mockResolvedValue(true);
    });

    it('должен копировать файлы из существующих директорий', async () => {
        mockReaddir.mockResolvedValue([{ isDirectory: () => false, isFile: () => true, name: 'file1.mdc' }]);
        mockMkdir.mockResolvedValue(undefined);
        mockCp.mockResolvedValue(undefined);

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor');

        expect(mockPathExists).toHaveBeenCalled();
        expect(mockReaddir).toHaveBeenCalled();
    });

    it('должен пропускать несуществующие директории', async () => {
        mockPathExists.mockResolvedValue(false);

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor');

        expect(mockPathExists).toHaveBeenCalled();
        expect(mockReaddir).not.toHaveBeenCalled();
    });

    it('должен фильтровать файлы по ignoreList', async () => {
        mockReaddir.mockResolvedValue([
            { isDirectory: () => false, isFile: () => true, name: 'file1.mdc' },
            { isDirectory: () => false, isFile: () => true, name: 'ignored.mdc' },
        ]);
        mockMkdir.mockResolvedValue(undefined);
        mockCp.mockResolvedValue(undefined);
        mockShouldIgnoreFile.mockImplementation((path: string) => path.includes('ignored.mdc'));

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor', ['ignored.mdc']);

        const expectedCalls = RULES_DIRS.length;
        expect(mockCp).toHaveBeenCalledTimes(expectedCalls);
    });

    it('должен применять fileOverrides после копирования', async () => {
        mockPathExists
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);
        mockReaddir.mockResolvedValue([{ isDirectory: () => false, isFile: () => true, name: 'file1.mdc' }]);
        mockMkdir.mockResolvedValue(undefined);
        mockCp.mockResolvedValue(undefined);
        mockApplyYamlOverrides.mockResolvedValue(undefined);

        const fileOverrides: FileOverride[] = [
            {
                file: 'rules/file1.mdc',
                yamlOverrides: {
                    alwaysApply: true,
                },
            },
        ];

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor', [], fileOverrides);

        expect(mockApplyYamlOverrides).toHaveBeenCalledWith(join(targetDir, '.cursor', 'rules/file1.mdc'), {
            alwaysApply: true,
        });
    });

    it('должен пропускать fileOverrides для несуществующих файлов', async () => {
        mockPathExists.mockImplementation((path: string) => {
            if (path.includes('nonexistent.mdc')) {
                return Promise.resolve(false);
            }

            return Promise.resolve(true);
        });
        mockReaddir.mockResolvedValue([{ isDirectory: () => false, isFile: () => true, name: 'file1.mdc' }]);
        mockMkdir.mockResolvedValue(undefined);
        mockCp.mockResolvedValue(undefined);

        const fileOverrides: FileOverride[] = [
            {
                file: 'rules/nonexistent.mdc',
                yamlOverrides: {
                    alwaysApply: true,
                },
            },
        ];

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor', [], fileOverrides);

        expect(mockApplyYamlOverrides).not.toHaveBeenCalled();
    });

    it('должен обрабатывать рекурсивные директории', async () => {
        mockReaddir
            .mockResolvedValueOnce([
                { isDirectory: () => true, isFile: () => false, name: 'subdir' },
                { isDirectory: () => false, isFile: () => true, name: 'file1.mdc' },
            ])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file2.mdc' }])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file3.mdc' }])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file4.mdc' }]);
        mockMkdir.mockResolvedValue(undefined);
        mockCp.mockResolvedValue(undefined);

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor');

        expect(mockReaddir).toHaveBeenCalledTimes(4);
    });

    it('должен выбрасывать ошибку если packageDir пустой', async () => {
        const targetDir = getTestPath('target');

        await expect(copyRulesToTarget('', targetDir, 'cursor')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        const packageDir = getTestPath('package');

        await expect(copyRulesToTarget(packageDir, '', 'cursor')).rejects.toThrow('targetDir is required');
    });

    it('должен игнорировать директорию если она в ignoreList', async () => {
        mockShouldIgnoreFile.mockImplementation((path: string) => path === 'rules');
        mockPathExists.mockResolvedValue(true);

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor', ['rules']);

        const rulesDirCalls = mockReaddir.mock.calls.filter((call) => call[0].replace(/\\/g, '/').includes('/rules'));
        expect(rulesDirCalls).toHaveLength(0);
    });

    it('должен игнорировать поддиректории если они в ignoreList', async () => {
        mockReaddir
            .mockResolvedValueOnce([
                { isDirectory: () => true, isFile: () => false, name: 'subdir' },
                { isDirectory: () => false, isFile: () => true, name: 'file1.mdc' },
            ])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file2.mdc' }])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file3.mdc' }]);
        mockShouldIgnoreFile.mockImplementation((path: string) => path === 'rules/subdir');
        mockMkdir.mockResolvedValue(undefined);
        mockCp.mockResolvedValue(undefined);

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor', ['rules/subdir']);

        const rulesDirCalls = mockReaddir.mock.calls.filter((call) => call[0].replace(/\\/g, '/').includes('/rules'));
        expect(rulesDirCalls).toHaveLength(1);
        expect(mockCp).toHaveBeenCalledTimes(RULES_DIRS.length);
    });

    it('должен копировать файлы исключённые отрицательными паттернами', async () => {
        mockReaddir
            .mockResolvedValueOnce([
                { isDirectory: () => false, isFile: () => true, name: 'prompt-workflow.mdc' },
                { isDirectory: () => false, isFile: () => true, name: 'other-file.mdc' },
            ])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file1.mdc' }])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file2.mdc' }]);
        mockShouldIgnoreFile.mockImplementation((path: string) => {
            if (path === 'rules/prompt-workflow.mdc') {
                return false;
            }
            if (path === 'rules/other-file.mdc') {
                return true;
            }
            if (path === 'rules') {
                return false;
            }

            return false;
        });
        mockMkdir.mockResolvedValue(undefined);
        mockCp.mockResolvedValue(undefined);

        const packageDir = getTestPath('package');
        const targetDir = getTestPath('target');

        await copyRulesToTarget(packageDir, targetDir, 'cursor', ['rules/**', '!rules/prompt-workflow.mdc']);

        const promptWorkflowCalls = mockCp.mock.calls.filter((call) => call[0].includes('prompt-workflow.mdc'));

        expect(promptWorkflowCalls.length).toBeGreaterThan(0);

        const otherFileCalls = mockCp.mock.calls.filter((call) => call[0].includes('other-file.mdc'));

        expect(otherFileCalls).toHaveLength(0);
    });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { compareVersions } from '../compare-versions';
import { getNpmVersion } from '../get-npm-version';
import { notifyIfUpdateAvailable } from '../notify-update';

vi.mock('picocolors', () => ({
    bold: (str: string) => str,
    cyan: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
}));

vi.mock('../get-npm-version');
vi.mock('../compare-versions');

describe('notifyIfUpdateAvailable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('должен вывести сообщение о доступном обновлении при patch обновлении', async () => {
        vi.mocked(getNpmVersion).mockResolvedValue('0.3.7');
        vi.mocked(compareVersions).mockReturnValue({
            changeType: 'patch',
            current: '0.3.6',
            target: '0.3.7',
        });

        await notifyIfUpdateAvailable('cursor-rules-cli', '0.3.6');

        expect(vi.mocked(console.log)).toHaveBeenCalled();
        const logs = vi.mocked(console.log).mock.calls.map((call) => call[0] as string);
        expect(logs.some((log) => log.includes('Update available!'))).toBe(true);
        expect(logs.some((log) => log.includes('0.3.6') && log.includes('0.3.7'))).toBe(true);
    });

    it('должен не выводить ничего если обновлений нет', async () => {
        vi.mocked(getNpmVersion).mockResolvedValue('0.3.6');
        vi.mocked(compareVersions).mockReturnValue({
            changeType: 'none',
            current: '0.3.6',
            target: '0.3.6',
        });

        await notifyIfUpdateAvailable('cursor-rules-cli', '0.3.6');

        expect(vi.mocked(console.log)).not.toHaveBeenCalled();
    });

    it('должен игнорировать ошибки при получении версии', async () => {
        vi.mocked(getNpmVersion).mockRejectedValue(new Error('Network error'));

        await expect(notifyIfUpdateAvailable('cursor-rules-cli', '0.3.6')).resolves.toBeUndefined();
    });

    it('должен вывести сообщение при minor обновлении', async () => {
        vi.mocked(getNpmVersion).mockResolvedValue('1.0.0');
        vi.mocked(compareVersions).mockReturnValue({
            changeType: 'minor',
            current: '0.3.6',
            target: '1.0.0',
        });

        await notifyIfUpdateAvailable('cursor-rules-cli', '0.3.6');

        expect(vi.mocked(console.log)).toHaveBeenCalled();
        const logs = vi.mocked(console.log).mock.calls.map((call) => call[0] as string);
        expect(logs.some((log) => log.includes('Update available!'))).toBe(true);
        expect(logs.some((log) => log.includes('0.3.6') && log.includes('1.0.0'))).toBe(true);
    });

    it('должен вывести сообщение при major обновлении', async () => {
        vi.mocked(getNpmVersion).mockResolvedValue('2.0.0');
        vi.mocked(compareVersions).mockReturnValue({
            changeType: 'major',
            current: '1.0.0',
            target: '2.0.0',
        });

        await notifyIfUpdateAvailable('cursor-rules-cli', '1.0.0');

        expect(vi.mocked(console.log)).toHaveBeenCalled();
        const logs = vi.mocked(console.log).mock.calls.map((call) => call[0] as string);
        expect(logs.some((log) => log.includes('Update available!'))).toBe(true);
        expect(logs.some((log) => log.includes('1.0.0') && log.includes('2.0.0'))).toBe(true);
    });
});

import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { notifyIfUpdateAvailable } from '../../../lib/version-manager/notify-update';
import { ensureLatestVersion } from '../ensure-latest-version';

vi.mock('../../../lib/version-manager/get-package-version');
vi.mock('../../../lib/version-manager/notify-update');

const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockNotifyIfUpdateAvailable = vi.mocked(notifyIfUpdateAvailable);

describe('ensureLatestVersion', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockNotifyIfUpdateAvailable.mockResolvedValue(undefined);
    });

    it('должен получать версию пакета и проверять обновления', async () => {
        const packageDir = process.cwd();

        await ensureLatestVersion(packageDir);

        expect(mockGetPackageVersion).toHaveBeenCalledTimes(1);
        expect(mockGetPackageVersion).toHaveBeenCalledWith(packageDir);
        expect(mockNotifyIfUpdateAvailable).toHaveBeenCalledTimes(1);
        expect(mockNotifyIfUpdateAvailable).toHaveBeenCalledWith('ai-rules-kit', '1.0.0');
    });

    it('должен выбрасывать ошибку при null packageDir', async () => {
        await expect(ensureLatestVersion(null as unknown as string)).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку при undefined packageDir', async () => {
        await expect(ensureLatestVersion(undefined as unknown as string)).rejects.toThrow('packageDir is required');
    });
});

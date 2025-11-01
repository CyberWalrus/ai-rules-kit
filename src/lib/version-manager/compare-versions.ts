import type { VersionComparison } from '../../model';
import { isEmptyString } from '../helpers';

/** Сравнивает две версии в формате semver */
export function compareVersions(current: string, target: string): VersionComparison {
    if (isEmptyString(current)) {
        throw new Error('current version is required');
    }
    if (isEmptyString(target)) {
        throw new Error('target version is required');
    }

    const parseCurrent = current.split('.').map(Number);
    const parseTarget = target.split('.').map(Number);

    const [currentMajor, currentMinor, currentPatch] = parseCurrent;
    const [targetMajor, targetMinor, targetPatch] = parseTarget;

    if (Number.isNaN(currentMajor) || Number.isNaN(currentMinor) || Number.isNaN(currentPatch)) {
        throw new Error('Invalid current version format');
    }
    if (Number.isNaN(targetMajor) || Number.isNaN(targetMinor) || Number.isNaN(targetPatch)) {
        throw new Error('Invalid target version format');
    }

    if (targetMajor > currentMajor) {
        return { changeType: 'major', current, target };
    }

    if (targetMajor === currentMajor && targetMinor > currentMinor) {
        return { changeType: 'minor', current, target };
    }

    if (targetMajor === currentMajor && targetMinor === currentMinor && targetPatch > currentPatch) {
        return { changeType: 'patch', current, target };
    }

    return { changeType: 'none', current, target };
}

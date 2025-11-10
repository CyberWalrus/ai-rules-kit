import type { VersionComparison } from '../../model';
import { isEmptyString } from '../helpers';

/** Сравнивает две версии в формате CalVer (YYYY.M.D.N) */
export function compareCalVerVersions(current: string, target: string): VersionComparison {
    if (isEmptyString(current)) {
        throw new Error('current version is required');
    }
    if (isEmptyString(target)) {
        throw new Error('target version is required');
    }

    const parseCurrent = current.split('.').map(Number);
    const parseTarget = target.split('.').map(Number);

    if (parseCurrent.length !== 4 || parseTarget.length !== 4) {
        throw new Error('CalVer version must be in format YYYY.M.D.N');
    }

    const [currentYear, currentMonth, currentDay, currentIncrement] = parseCurrent;
    const [targetYear, targetMonth, targetDay, targetIncrement] = parseTarget;

    if (
        Number.isNaN(currentYear) ||
        Number.isNaN(currentMonth) ||
        Number.isNaN(currentDay) ||
        Number.isNaN(currentIncrement)
    ) {
        throw new Error('Invalid current version format');
    }
    if (
        Number.isNaN(targetYear) ||
        Number.isNaN(targetMonth) ||
        Number.isNaN(targetDay) ||
        Number.isNaN(targetIncrement)
    ) {
        throw new Error('Invalid target version format');
    }

    if (targetYear > currentYear) {
        return { changeType: 'major', current, target };
    }

    if (targetYear < currentYear) {
        return { changeType: 'none', current, target };
    }

    if (targetMonth > currentMonth) {
        return { changeType: 'major', current, target };
    }

    if (targetMonth < currentMonth) {
        return { changeType: 'none', current, target };
    }

    if (targetDay > currentDay) {
        return { changeType: 'minor', current, target };
    }

    if (targetDay < currentDay) {
        return { changeType: 'none', current, target };
    }

    if (targetIncrement > currentIncrement) {
        return { changeType: 'patch', current, target };
    }

    return { changeType: 'none', current, target };
}

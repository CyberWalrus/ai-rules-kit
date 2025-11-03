export { RULES_DIRS, VERSION_FILE_NAME } from './constants/main';
export {
    type InitCommandParams,
    initCommandParamsSchema,
    type ReplaceAllCommandParams,
    replaceAllCommandParamsSchema,
    type UpdateCommandParams,
    updateCommandParamsSchema,
} from './schemas/command-params';
export { type VersionData } from './schemas/main';
export type { CommandType, RulesConfig, VersionComparison, VersionDiff, VersionInfo } from './types/main';

export {
    GITHUB_REPO,
    RULES_DIRS,
    SYSTEM_RULES_DIR,
    SYSTEM_RULES_TAG_PREFIX,
    VERSION_FILE_NAME,
} from './constants/main';
export {
    COMMANDS_DIR_PLACEHOLDER,
    DOCS_DIR_PLACEHOLDER,
    FILE_EXT_PLACEHOLDER,
    IDE_DIR_PLACEHOLDER,
    RULES_DIR_PLACEHOLDER,
} from './constants/placeholders';
export {
    type InitCommandParams,
    initCommandParamsSchema,
    type ReplaceAllCommandParams,
    replaceAllCommandParamsSchema,
    type UpgradeCommandParams,
    upgradeCommandParamsSchema,
} from './schemas/command-params';
export { rulesConfigSchema } from './schemas/main';
export type {
    CheckAndUpdateOptions,
    CommandType,
    FileOverride,
    McpConfig,
    McpServerConfig,
    McpSettings,
    RulesConfig,
    RuleSet,
    UserConfig,
    UserMetaInfo,
    VersionComparison,
    VersionDiff,
} from './types/main';

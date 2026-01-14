/** Имя файла для хранения конфигурации правил */
export const VERSION_FILE_NAME = 'ai-rules-kit-config.json';

/** Директории с правилами для копирования (относительно корня пакета) */
export const RULES_DIRS = ['rules', 'docs', 'commands'] as const;

/** Имена файлов для Claude Code */
export const CLAUDE_MAIN_FILE_NAME = 'CLAUDE.md';
export const CLAUDE_SKILL_FILE_NAME = 'SKILL.md';
export const CLAUDE_DOCS_CATALOG_FILE_NAME = 'docs-catalog.md';

/** GitHub репозиторий с правилами */
export const GITHUB_REPO = 'CyberWalrus/ai-rules-kit' as const;

/** URL npm registry */
export const NPM_REGISTRY_URL = 'https://registry.npmjs.org' as const;

/** Timeout для HTTP запросов к npm registry (в миллисекундах) */
export const NPM_REQUEST_TIMEOUT = 5_000 as const;

/** Имя файла для хранения глобальной конфигурации пользователя */
export const USER_CONFIG_FILE_NAME = 'config.json' as const;

/** Директория с системными правилами (относительно корня пакета) */
export const SYSTEM_RULES_DIR = 'system-rules' as const;

/** Префикс тегов для системных правил в GitHub */
export const SYSTEM_RULES_TAG_PREFIX = 'system-rules/v' as const;

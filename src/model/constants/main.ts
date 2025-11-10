/** Имя файла для хранения конфигурации правил */
export const VERSION_FILE_NAME = 'cursor-rules-config.json';

/** Директории с правилами для копирования */
export const RULES_DIRS = ['.cursor/rules', '.cursor/docs', '.cursor/commands'] as const;

/** GitHub репозиторий с правилами */
export const GITHUB_REPO = 'CyberWalrus/cursor-rules' as const;

/** URL npm registry */
export const NPM_REGISTRY_URL = 'https://registry.npmjs.org' as const;

/** Timeout для HTTP запросов к npm registry (в миллисекундах) */
export const NPM_REQUEST_TIMEOUT = 5_000 as const;

/** Тип команды CLI */
export type CommandType = 'config' | 'init' | 'replace-all' | 'system-files' | 'upgrade';

/** Тип действия интерактивного меню */
export type InteractiveMenuAction = 'config' | 'exit' | 'init' | 'system-files' | 'upgrade' | 'versions';

/** Тип поддерживаемой IDE */
export type IdeType = 'claude-code' | 'cursor' | 'trae';

/** Конфигурация правил */
export type RulesConfig = {
    /** Версия CLI тулзы */
    cliVersion: string;
    /** Версия формата конфигурации */
    configVersion: string;
    /** Тип используемой IDE */
    ideType: IdeType;
    /** Дата установки */
    installedAt: string;
    /** Версия промптов */
    promptsVersion: string;
    /** Наборы правил */
    ruleSets: RuleSet[];
    /** Настройки */
    settings: {
        /** Язык вывода сообщений */
        language: 'en' | 'ru';
    };
    /** Источник правил */
    source: string;
    /** Дата последнего обновления */
    updatedAt: string;
    /** Переопределения YAML параметров для файлов */
    fileOverrides?: FileOverride[];
    /** Список файлов для игнорирования */
    ignoreList?: string[];
    /** Версия системных правил */
    systemRulesVersion?: string;
    /** Версия правил (deprecated, используйте promptsVersion) */
    version?: string;
};

/** Набор правил */
export type RuleSet = {
    /** Идентификатор набора */
    id: string;
    /** Обновлять ли этот набор */
    update: boolean;
    /** Зафиксированная версия (опционально) */
    fixedVersion?: string;
};

/** Переопределение параметров файла */
export type FileOverride = {
    /** Путь к файлу (относительно .cursor/) */
    file: string;
    /** YAML параметры для переопределения */
    yamlOverrides: Record<string, unknown>;
};

/** Результат сравнения версий */
export type VersionComparison = {
    /** Тип изменения */
    changeType: 'major' | 'minor' | 'none' | 'patch';
    /** Текущая версия */
    current: string;
    /** Целевая версия */
    target: string;
};

/** Diff между версиями */
export type VersionDiff = {
    /** Файлы для добавления */
    toAdd: string[];
    /** Файлы для удаления */
    toDelete: string[];
    /** Файлы для обновления */
    toUpdate: string[];
};

/** Карта путей файлов и их хешей */
export type FileHashMap = Map<string, string>;

/** Параметры для функции проверки и обновления */
export type CheckAndUpdateOptions = {
    /** Перезапускать процесс после обновления (по умолчанию: true) */
    isRespawn?: boolean;
    /** Пропустить автоматическое обновление */
    isSkipUpdate?: boolean;
};

/** Метаинформация пользователя */
export type UserMetaInfo = {
    /** Возраст */
    age?: number;
    /** Стиль общения */
    communicationStyle?: string;
    /** Устройство */
    device?: string;
    /** Язык */
    language?: string;
    /** Локация */
    location?: string;
    /** Имя пользователя */
    name?: string;
    /** Операционная система */
    os?: string;
    /** Роль */
    role?: string;
    /** Технологический стек */
    stack?: string;
    /** Версии инструментов */
    toolVersions?: string;
};

/** Настройки MCP серверов */
export type McpSettings = {
    /** AI модель */
    aiModel: string;
    /** API ключ */
    apiKey: string;
    /** API провайдеры */
    apiProviders?: string;
};

/** Глобальная конфигурация пользователя */
export type UserConfig = {
    /** Дополнительные настройки */
    [key: string]: unknown;
    /** Язык интерфейса */
    language: 'en' | 'ru';
    /** GitHub API токен */
    githubToken?: string;
    /** Выбранная IDE */
    ideType?: IdeType;
    /** Настройки MCP серверов */
    mcpSettings?: McpSettings;
    /** Метаинформация пользователя */
    metaInfo?: UserMetaInfo;
};

/** Конфигурация MCP сервера */
export type McpServerConfig = {
    /** Команда запуска */
    command: string;
    /** Аргументы команды */
    args?: string[];
    /** Переменные окружения */
    env?: Record<string, string>;
};

/** Конфигурация MCP серверов */
export type McpConfig = {
    /** MCP серверы */
    mcpServers: Record<string, McpServerConfig>;
};

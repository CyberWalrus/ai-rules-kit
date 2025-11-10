/** Тип команды CLI */
export type CommandType = 'init' | 'replace-all' | 'update';

/** Конфигурация правил */
export type RulesConfig = {
    /** Версия CLI тулзы */
    cliVersion: string;
    /** Версия формата конфигурации */
    configVersion: string;
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

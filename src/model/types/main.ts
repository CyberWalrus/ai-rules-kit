/** Тип команды CLI */
export type CommandType = 'init' | 'replace-all' | 'update';

/** Информация о версии правил */
export type VersionInfo = {
    /** Дата установки */
    installedAt: string;
    /** Источник правил */
    source: string;
    /** Версия правил */
    version: string;
};

/** Конфигурация правил */
export type RulesConfig = {
    /** Путь к директории .cursor */
    cursorDir: string;
    /** Пути к файлам правил */
    rulesPaths: string[];
    /** Имя файла версии */
    versionFileName: string;
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

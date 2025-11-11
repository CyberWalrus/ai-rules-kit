# Changelog

## [0.4.1] - 2025-11-10

<small>10.11.2025 18:57</small>

### Added

- **CalVer version comparison and askConfirmation helper**
    - Added `compareCalVerVersions` function for comparing CalVer format versions (YYYY.M.D.N)
    - Added `askConfirmation` helper function for interactive user confirmation prompts
    - Integrated CalVer comparison into upgrade command for version validation
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/cf0d86aed5adb2e05d528403e8fc58e955fa25e2" target="_blank">cf0d86a</a>

- **PromptsVersion support and upgrade logic improvements**
    - Added `promptsVersion` field to configuration for tracking prompts releases separately from CLI version
    - Improved upgrade command to fetch latest prompts version from GitHub releases
    - Enhanced version comparison logic with CalVer support
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/45a8fbd77152596df63a6de7ae7c54a80cccea2c" target="_blank">45a8fbd</a>

- **GitHub API token support**
    - Added support for GitHub API token authentication in `get-latest-prompts-version`
    - Improved reliability of version fetching from GitHub releases
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/08b738277fb8df8395355b5f8ff056bb148e2365" target="_blank">08b7382</a>

### Changed

- **Rename update command to upgrade**
    - Renamed `update` command to `upgrade` for better clarity
    - Updated all references, tests, and documentation
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/8081d647156d2ada566a33a9e1d85cd07c648c9f" target="_blank">8081d64</a>

- **Workflows and configuration updates**
    - Updated GitHub Actions workflows for publish and release-prompts
    - Updated knip configuration
    - Added cursor-rules config for project itself
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/620f8cfeb7f9ecb70f6b601ed2973af2498fbd38" target="_blank">620f8cf</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/19c3f3edc947851c75af6eba47b157cede850700" target="_blank">19c3f3e</a>

- **Test helpers simplification**
    - Simplified copy-rules-fixtures helper by removing unused filter
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/be48b9403ee000f0e660836c8fd3a6412bd59305" target="_blank">be48b94</a>

### Docs

- **Documentation and architecture updates**
    - Updated package AI documentation with new features
    - Updated architecture XML with new modules
    - Updated chat mode router rules
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/d174e3017b1607c895b9df333b8cbf2141d58363" target="_blank">d174e30</a>

- **GitHub API token usage documentation**
    - Added documentation for GitHub API token usage in get-latest-prompts-version
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/3ce4e3130d3ccf9d3593454607780d6f43af5f96" target="_blank">3ce4e31</a>

## [0.4.0] - 2025-11-10

<small>10.11.2025 14:50</small>

### Added

- **GitHub fetcher module for prompts**
    - Added new module `github-fetcher` for fetching prompts from GitHub releases
    - Integrated GitHub fetcher into init, update, and replace-all commands
    - Updated configuration types and schemas to support prompts versioning
    - Added helper function for creating test configuration
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/48ada768ca1406cc2a8aafdac074a4dc357cdbe1" target="_blank">48ada76</a>

- **CI/CD workflow for automatic prompts versioning**
    - Added GitHub Actions workflow for automatic CalVer versioning of prompts
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/1cd9633d0022c3d0b56c2e3a4eabdf1485304c47" target="_blank">1cd9633</a>

### Changed

- **Package configuration updates**
    - Added tar dependency for extracting prompts tarballs
    - Updated publish workflow configuration
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/b2fe7b0db518cedda738e744c3b74c7b61347b4a" target="_blank">b2fe7b0</a>

### Docs

- **Documentation and prompts updates**
    - Updated agent analysis, changelog, and commit commands
    - Improved chat mode router and agent mode workflow rules
    - Enhanced plan mode dispatcher and prompt structure guide
    - Updated package AI documentation
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/2f6ded9f7b0c7741262bc1624026dee33d8a9f30" target="_blank">2f6ded9</a>

### Tests

- **Test for updated schemas**
    - Added test for updated configuration schemas
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/5b38401569b54d3a2fb54e08c8d38013fe2d8175" target="_blank">5b38401</a>

## [0.3.11] - 2025-11-09

<small>09.11.2025 21:28</small>

### Docs

- **Улучшение документации команды анализа и протокола объявления режима**
    - Расширены требования к анализу всей истории чата с самого начала
    - Добавлены запреты на действия после анализа
    - Улучшена структура отчёта с детальной саморефлексией
    - Уточнён протокол объявления режима с явными проверками и чеклистом
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/e226309c2328c7906bd6b75fc929f22ff6255d86" target="_blank">e226309</a>

### Tests

- **Добавление моков и проверок в тесты версионирования**
    - Добавлены моки для picocolors в тестах notify-update
    - Добавлены моки для getPackageVersion и notifyIfUpdateAvailable в тестах main
    - Добавлены проверки длины строк в тестах форматирования уведомлений
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/f805738caaaa151e2573bb67c52713f8d665687b" target="_blank">f805738</a>

## [0.3.10] - 2025-11-09

<small>09.11.2025 20:51</small>

### Changed

- **Неблокирующая проверка версии пакета**
    - Проверка версии пакета теперь выполняется в фоне, не блокируя выполнение команды
    - Команды запускаются немедленно, даже при недоступности npm registry
    - Улучшена обработка ошибок в get-npm-version с гарантированной очисткой таймаута
    - Добавлены тесты для неблокирующего выполнения проверки версии

## [0.3.9] - 2025-11-09

<small>09.11.2025 20:23</small>

### Changed

- **Улучшение команды генерации changelog**
    - Расширен алгоритм генерации changelog для автоматического обновления всех пропущенных версий
    - Добавлена поддержка работы с version.json и package.json
    - Улучшена группировка коммитов по типам и путям файлов
    - Добавлена обработка незакоммиченных изменений

## [0.3.8] - 2025-11-09

<small>09.11.2025 20:08</small>

### Changed

- **Улучшение документации и промптов**
    - Обновлена документация с уточнениями протоколов и правил работы агента
    - Улучшены промпты для более точного соблюдения протоколов
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/b350962fadbb70a5e49d8ce810f5c8612e092f33" target="_blank">b350962</a>

- **Улучшение форматирования уведомлений**
    - Улучшено форматирование уведомлений об обновлениях с использованием функции formatBoxLine
    - Добавлена поддержка отладки ошибок в режиме разработки
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/935e176a2e1a9a1bbbf230a441e10ccfd268b1da" target="_blank">935e176</a>

- **Конфигурация ESLint**
    - Добавлен флаг --max-warnings 0 для строгой проверки предупреждений
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/d9e7de50f367a1fbb4039c1be18d2536a6cb5325" target="_blank">d9e7de5</a>

### Test

- **Добавление тестов**
    - Добавлены unit тесты для функции notifyIfUpdateAvailable
    - Удалена неиспользуемая переменная из E2E тестов
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/c1dbd6c5573221ed0d51599ade9970799a94989c" target="_blank">c1dbd6c</a>

## [0.3.7] - 2025-11-09

<small>09.11.2025 18:24</small>

### Changed

- **Упрощение документации**
    - Упрощены формулировки в plan-mode-dispatcher.mdc и code-workflow.mdc
    - Заменен prompt-workflow-compact.mdc на prompt-structure-guide.mdc
    - Обновлены ссылки на документацию в agent-mode-workflow
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/cece6e48e0ffe4243516dc0de4f46ff8a91b4aaa" target="_blank">cece6e4</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/61b2fd3c3c2ed693d36a418fb14981c40c1c5f53" target="_blank">61b2fd3</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/b88e3b0cfe7be4fa19433a709721c72914a65121" target="_blank">b88e3b0</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/4d80fa4c4fae39916ca7383665c96fe0e35f81df" target="_blank">4d80fa4</a>

- **Рефакторинг кода**
    - Упрощено условие в copy-rules-to-target.ts
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/0b2721f1f07ae4410a1b5ac1046d4c2e6d31610b" target="_blank">0b2721f</a>

## [0.3.6] - 2025-11-09

<small>09.11.2025 03:35</small>

### Changed

- **Улучшение правил активации и классификации**
    - Улучшены правила активации и классификации в plan-mode-dispatcher.mdc
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/53958d20eb6dd47de18d21424ab6f6f3789b4f82" target="_blank">53958d2</a>

- **Рефакторинг обновлений**
    - Заменено автоматическое обновление на уведомление о доступных обновлениях
    - Переведена сборка с ESM на CommonJS для лучшей совместимости
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/80a17400b0db2472fa4f6313b03baebccecb48f7" target="_blank">80a1740</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/319b40eb8fddec15cffcfbda158ba74313554a21" target="_blank">319b40e</a>

- **Упрощение структуры**
    - Упрощена структура шаблона meta-info
    - Удален ненужный импорт normalize и упрощена нормализация путей
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/61fb2f538ecb3ad4c62c8fba309a67b35d0b5781" target="_blank">61fb2f5</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/527b0655e67a45d16c72e02b41c886e8e88cbeb2" target="_blank">527b065</a>

### Fixed

- **Исправление нормализации путей**
    - Исправлен порядок нормализации пути в should-ignore-file
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/eeca1857442aa8596902c4e605f5bf8fe8d926ce" target="_blank">eeca185</a>

## [0.3.4] - 2025-11-07

<small>07.11.2025 16:50</small>

### Changed

- **Обновление схемы конфигурации**
    - Добавлена поддержка $schema в конфигурацию
    - Изменен $id схемы на GitHub URL
    - Удален workflow публикации схемы в SchemaStore
    - Обновлена ссылка на схему и описание в README
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/90c0b52fb65955e47ea6af29bd59af8b9d60f34f" target="_blank">90c0b52</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/24c0dc868ab752c035712e6f86b996d0c76ff014" target="_blank">24c0dc8</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/5409c4e92562da75eb8a682f52a013540aa3b955" target="_blank">5409c4e</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/e9f3110c1d6421ef69db15f78b5cd1c46d34669e" target="_blank">e9f3110</a>

### Docs

- **Обновление CHANGELOG**
    - Обновлен CHANGELOG для версии 0.3.3
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/eb764bc0dcf671edb6ae72f4e90df98d3930d4cc" target="_blank">eb764bc</a>

## [0.3.2] - 2025-11-07

<small>07.11.2025 13:03</small>

### Changed

- **Расширение функциональности CLI**
    - Добавлена поддержка новой конфигурации
    - Улучшена обработка команд
    - Обновлена документация
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/2a4209255881a36a4ae46b1082ab94379498aa56" target="_blank">2a42092</a>

- **Обновление конфигурации сборки**
    - Добавлена платформа 'node' в конфигурацию сборки
    - Исключен 'micromatch' из внешних зависимостей
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/f65668d84751ee1ec7c30d8b9fa884eaad2b0a5e" target="_blank">f65668d</a>

### Test

- **Улучшение тестов**
    - Заменен хардкод путей на getTestPath в тестах
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/ea1c962748bfe53e2a534cd6ca9a12b03009b330" target="_blank">ea1c962</a>

### Style

- **Форматирование**
    - Добавлена пустая строка в конце schema файла
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/d83e3309b1963bdebb2c95b7b1137b4839f83664" target="_blank">d83e330</a>

## [0.3.3] - 2025-11-07

<small>07.11.2025 15:48</small>

### Added

- **Respawn механизм для перезапуска процесса после обновления**
    - Добавлена функция `respawnProcess` для перезапуска CLI процесса после автоматического обновления пакета
    - Реализован механизм перезапуска через `child_process.spawn()` с detached флагом для загрузки обновленного кода
    - Добавлен параметр `isRespawn` в `CheckAndUpdateOptions` для управления поведением перезапуска
    - Добавлены unit тесты для функции `respawnProcess` и обновлены тесты `checkAndUpdatePackage`
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/2ee11ad148ef3c54375554dc668434efffa55451" target="_blank">2ee11ad</a>

### Changed

- **Обновление документации и архитектуры**
    - Обновлена AI-документация с описанием respawn механизма и process respawn логики
    - Обновлена архитектура XML с добавлением модуля `respawn-process` в version-manager
    - Добавлено описание механизма перезапуска процесса для гарантии выполнения обновленного кода
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/6058f8c075c8ff02ac0770c387642ffe937f5bb6" target="_blank">6058f8c</a>

- **Изменение способа установки GitHub CLI в CI/CD**
    - Заменен GitHub Actions setup-cli на ручную установку через apt для улучшения совместимости
    - Обновлен workflow публикации схемы для использования нативного пакетного менеджера
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/13a7cbde78cbde2fa68c3bdaac3559f1b9089d5a" target="_blank">13a7cbd</a>

### Docs

- **Улучшение описания временного контекста в шаблоне**
    - Добавлена секция CRITICAL - TEMPORAL CONTEXT с явным указанием текущей даты
    - Улучшено описание обязательности использования указанной даты для временных операций
    - Обновлен completion criteria с проверкой запоминания текущей даты
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/7ef18430cfaa46ce00370f1d482552949d478e75" target="_blank">7ef1843</a>

## [0.3.0] - 2025-11-07

### Breaking Changes

- **Новый формат конфигурации правил**
    - Файл `.cursor/rules-version.json` заменен на `.cursor/cursor-rules-config.json`
    - Добавлена поддержка расширенной конфигурации с настройками, наборами правил, списком игнорирования и переопределениями файлов
    - Формат больше не совместим со старыми версиями — требуется повторная инициализация через `cursor-rules-cli init`
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

### Added

- **Расширенная конфигурация правил**
    - Добавлен новый формат конфигурации `cursor-rules-config.json` с поддержкой:
        - Настройки языка вывода (`settings.language`: `"ru"` или `"en"`)
        - Наборы правил (`ruleSets`) с возможностью управления обновлениями
        - Список игнорирования файлов (`ignoreList`) с поддержкой glob-паттернов
        - Переопределения YAML frontmatter для конкретных файлов (`fileOverrides`)
    - Добавлена JSON Schema для валидации конфигурации (`.cursor/cursor-rules-config-1.0.0.schema.json`)
    - Автоматическая публикация JSON Schema в SchemaStore.org через CI/CD
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

- **Новые функции для работы с файлами**
    - Добавлена функция `shouldIgnoreFile` для проверки файлов по списку игнорирования с поддержкой glob-паттернов
    - Добавлена функция `applyYamlOverrides` для применения переопределений YAML frontmatter с merge-стратегией
    - Обновлена функция `copyRulesToTarget` для поддержки `ignoreList` и `fileOverrides`
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

- **Зависимости**
    - Добавлена зависимость `micromatch` (v4.0.8) для работы с glob-паттернами
    - Добавлена зависимость `gray-matter` (v4.0.3) для парсинга YAML frontmatter
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

- **CI/CD**
    - Добавлен workflow `.github/workflows/publish-schema.yml` для автоматической публикации JSON Schema в SchemaStore.org
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

### Changed

- **Обновление CLI команд**
    - Команда `init` создает новый формат конфигурации с настройками по умолчанию
    - Команда `update` фильтрует наборы правил по флагу `update` и применяет `ignoreList`/`fileOverrides`
    - Команда `replace-all` сохраняет существующую конфигурацию или создает новую при отсутствии
    - Все команды обновляют поле `updatedAt` при изменении правил
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

- **Рефакторинг модулей**
    - Переименованы функции `readVersionFile` → `readConfigFile` и `writeVersionFile` → `writeConfigFile`
    - Обновлены типы: `VersionInfo` заменен на `RulesConfig` с расширенной структурой
    - Обновлены схемы валидации: добавлены `rulesConfigSchema`, `ruleSetSchema`, `fileOverrideSchema`
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

- **Тесты**
    - Обновлены все unit и E2E тесты для работы с новым форматом конфигурации
    - Добавлены тесты для новых функций `shouldIgnoreFile` и `applyYamlOverrides`
    - Обновлены тесты CLI команд для проверки работы с `ruleSets`, `ignoreList` и `fileOverrides`
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

### Removed

- **Удалена поддержка старого формата**
    - Удален тип `VersionInfo` и схема `versionSchema`
    - Удалены функции `readVersionFile` и `writeVersionFile`
    - Старый формат `.cursor/rules-version.json` больше не поддерживается
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/TODO" target="_blank">TODO</a>

## [0.2.3] - 2025-11-07

<small>07.11.2025 09:29</small>

### Changed

- **Улучшение протокольного соблюдения**
    - Внесены изменения в правила чата для улучшения протокольного соблюдения
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/4e8128159abf0b5cd3056ddc8c02b092f42ba984" target="_blank">4e81281</a>

## [0.2.2] - 2025-11-07

<small>07.11.2025 08:56</small>

### Changed

- **Обновление зависимостей**
    - Обновлена зависимость ai-friendly-runner до 0.4.2
    - Внесены изменения в правила чата для улучшения протокольного соблюдения
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/6807796f18b3db9b8734180e660b0bc162727f4e" target="_blank">6807796</a>

- **Документация и тесты**
    - Обновлена документация по кросс-платформенному тестированию
    - Улучшена совместимость тестов, исправлен скрипт линтинга
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/546e9590922be5beed024c3cf6a6ba0f16a8d3a7" target="_blank">546e959</a>

## [0.2.0] - 2025-11-04

<small>04.11.2025 05:41</small>

### Added

- **Автоматическая проверка и обновление версии пакета**
    - Добавлены функции для получения версии из npm registry и автоматического обновления пакета
    - Реализована проверка версии перед выполнением CLI команд
    - Добавлены функции `getNpmVersion`, `updatePackage` и `checkAndUpdatePackage` в модуль version-manager
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/d63352100769df332a351ed0b63b419a8491ef9f" target="_blank">d633521</a>

- **Интеграция проверки версии в CLI**
    - Добавлена автоматическая проверка версии перед выполнением команд init, replace-all и update
    - Созданы вспомогательные функции `ensureLatestVersion` и `getTargetDir` для работы CLI
    - Обеспечена обработка ошибок при проверке версии без блокировки выполнения команд
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/f470f31b6e9352b99dcd982e7953f70184125a07" target="_blank">f470f31</a>

- **Тесты для функций проверки версии**
    - Добавлены unit тесты для всех новых функций проверки и обновления версии
    - Покрытие тестами функций работы с npm registry и обновления пакета
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/083c167adf7d2f77ee31528ac062a5fc16906c26" target="_blank">083c167</a>

### Changed

- **Рефакторинг обработки путей файлов**
    - Перемещен файл версии в `.cursor/rules-version.json` для лучшей организации
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/6f2ce902fda7e5f7d6085946fb3c2cba3ec34db8" target="_blank">6f2ce90</a>

- **Обновление зависимостей**
    - Обновлен ai-friendly-runner до версии 0.4.0
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/52cff61f783c7f1474e4b110ccca0e1b785c8d88" target="_blank">52cff61</a>

- **Обновление конфигурации ESLint**
    - Отключено правило `no-console` для поддержки логирования в CLI приложении
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/d9279c4178071d0f5cad93f0995dffa1df9211de" target="_blank">d9279c4</a>

## [0.2.1] - 2025-11-04

<small>04.11.2025 05:57</small>

### Docs

- **Улучшение документации по кросс-платформенному тестированию**
    - Добавлена секция TIER 8: Cross-Platform Testing с правилами работы с путями в тестах
    - Добавлены рекомендации по использованию `path.join()` и нормализации путей для Windows, macOS и Linux
    - Обновлен список Common Mistakes в compact версии правил тестирования
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/63d946cd09b1a90eea48df7dac931f4cab402c56" target="_blank">63d946c</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/5c97090694fd054e1cf64c83f5b8b89d9dbbb968" target="_blank">5c97090</a>

### Changed

- **Улучшение кросс-платформенной совместимости тестов**
    - Обновлены тесты для функций работы с файлами с использованием `path.join()` вместо строковой конкатенации
    - Улучшена совместимость тестов с различными операционными системами
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/4c909c0ef8a62c8f2a4735cbecafa294cfc92704" target="_blank">4c909c0</a>

- **Исправление скрипта линтинга**
    - Исправлены кавычки в скрипте линтинга в package.json для корректного выполнения команд
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/9ac6221d5f507dd9887d4720008dc25f1ea6f471" target="_blank">9ac6221</a>

## [0.1.9] - 2025-11-04

<small>04.11.2025 04:01</small>

### Added

- **Автоматическая проверка и обновление версии пакета**
    - Добавлены функции для получения версии из npm registry и автоматического обновления пакета
    - Реализована проверка версии перед выполнением CLI команд с автоматическим обновлением при необходимости
    - Добавлены функции `getNpmVersion`, `updatePackage` и `checkAndUpdatePackage` в модуль version-manager
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/d63352100769df332a351ed0b63b419a8491ef9f" target="_blank">d633521</a>

- **Интеграция проверки версии в CLI**
    - Добавлена автоматическая проверка версии перед выполнением команд init, replace-all и update
    - Созданы вспомогательные функции `ensureLatestVersion` и `getTargetDir` для работы CLI
    - Обеспечена обработка ошибок при проверке версии без блокировки выполнения команд
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/f470f31b6e9352b99dcd982e7953f70184125a07" target="_blank">f470f31</a>

- **Тесты для функций проверки версии**
    - Добавлены unit тесты для всех новых функций проверки и обновления версии
    - Покрытие тестами функций работы с npm registry и обновления пакета
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/083c167adf7d2f77ee31528ac062a5fc16906c26" target="_blank">083c167</a>

### Changed

- **Рефакторинг обработки путей файлов**
    - Упрощена обработка путей в `calculateDiff` и `scanDirectory` с заменой обратных слэшей на прямые
    - Улучшена кроссплатформенная совместимость работы с путями
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/6b9c1849e141097caf001033b8d927412e408e9f" target="_blank">6b9c184</a>

- **Обновление конфигурации CI/CD**
    - Заменены тестовые задачи на задачи линтинга в CI/CD конфигурации
    - Улучшена структура pipeline для более эффективной проверки качества кода
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/af54834547ea3308e161ba1c15084e1d7dc23a7c" target="_blank">af54834</a>

- **Обновление зависимостей и инструментов**
    - Обновлен ai-friendly-runner до версии 0.4.0
    - Добавлена конфигурация knip для анализа неиспользуемого кода
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/934b746ca742b756fc6ce7a1aaee8f2bea8f3166" target="_blank">934b746</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/52cff61f783c7f1474e4b110ccca0e1b785c8d88" target="_blank">52cff61</a>

- **Упрощение проверок и типизации**
    - Упрощены проверки и добавлена типизация в catch блоках
    - Улучшена типобезопасность обработки ошибок
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/29c7916634fc59c17b96f8dc5d3e894f16a0333e" target="_blank">29c7916</a>

- **Обновление расположения файла версии**
    - Перемещен файл версии в `.cursor/rules-version.json` для лучшей организации
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/6f2ce902fda7e5f7d6085946fb3c2cba3ec34db8" target="_blank">6f2ce90</a>

- **Обновление конфигурации ESLint**
    - Отключено правило `no-console` для поддержки логирования в CLI приложении
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/d9279c4178071d0f5cad93f0995dffa1df9211de" target="_blank">d9279c4</a>

### Removed

- **Удаление поддержки user-rules директории**
    - Удалена поддержка директории user-rules для упрощения архитектуры
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/93cd9fdef01166d3c8d844f742939f5f90ba7aa4" target="_blank">93cd9fd</a>

### Docs

- **Обновление документации**
    - Обновлена архитектура с добавлением scripts слоя
    - Добавлена документация quality:check в AI-документацию
    - Обновлен протокол роутера режимов для условного выполнения
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/95a2dadfcbabc1a1397b262f1897d557751fd7f9" target="_blank">95a2dad</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/8d58ec2301bf7c42ec7a3d1b98f0bdb949e289c0" target="_blank">8d58ec2</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/93a8cc180e96c962099cbe2b5f41ed3b99261193" target="_blank">93a8cc1</a>

## [0.1.7] - 2025-11-02

<small>02.11.2025 04:19</small>

### Added

- **Схемы валидации параметров команд**
    - Добавлены Zod-схемы для валидации параметров CLI команд
    - Обеспечена типобезопасность и валидация входных данных
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/9b35f311ddd7431c8174810c15d4fb1ff1292603" target="_blank">9b35f31</a>

- **Модуль утилит helpers**
    - Добавлена функция проверки пустых строк для валидации входных данных
    - Создан фасад модуля для единообразного экспорта утилит
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/f3d3d76b30737f4e3a85e416947a4eb9c91c1fc4" target="_blank">f3d3d76</a>

- **Функции для работы с файлами и директориями**
    - Добавлены функции хеширования файлов и сканирования директорий
    - Улучшена поддержка вычисления разницы между версиями правил
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/031fb09ed99b7f928b90e2b9d884eb3770f2b0aa" target="_blank">031fb09</a>

- **Фасад модели и обновление типов**
    - Добавлен фасад model/index.ts для централизованного экспорта
    - Обновлены типы для улучшения типобезопасности
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/ccb9402ed146eec83ea1e6551c5af6cb7572622d" target="_blank">ccb9402</a>

### Changed

- **Рефакторинг модулей file-operations и version-manager**
    - Упрощена логика работы с файлами и версиями
    - Улучшена читаемость и поддерживаемость кода
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/8847101b8aaaaa468d1da9d2573d5f8608feb0ef" target="_blank">8847101</a>

- **Упрощение calculate-diff**
    - Рефакторинг модуля вычисления разницы с использованием новых утилит
    - Улучшена производительность и структура кода
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/dd7a8d0918a565cdbd880b089d12cf7663a51031" target="_blank">dd7a8d0</a>

- **Обновление CLI команд**
    - Интеграция новых схем валидации параметров во все CLI команды
    - Улучшена обработка ошибок и валидация входных данных
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/a95c24c5c76a51736c051aa4daaec3b0da728031" target="_blank">a95c24c</a>

- **Обновление E2E тестов**
    - Переименованы хелперы для большей ясности (copy-fixtures → copy-rules-fixtures)
    - Добавлен хелпер create-version-file для создания версионных файлов в тестах
    - Улучшена структура вспомогательных функций для тестирования
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/0a724fcf6f2f71dc4eb4400be135bc45904c6fea" target="_blank">0a724fc</a>

## [0.1.6] - 2025-11-01

<small>01.11.2025 23:54</small>

### Added

- **Unit тесты для модулей CLI и библиотек**
    - Добавлены unit тесты для команд init, update, replace-all с полным покрытием функциональности
    - Добавлены unit тесты для модулей diff-calculator и CLI main с проверкой различных сценариев
    - Общее покрытие: 626 строк тестового кода
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/1b6708c4cb02434250fb278d9561082a93936e06" target="_blank">1b6708c</a>

- **E2E тесты для полного цикла команд**
    - Добавлены e2e тесты для команд init, update, replace-all с проверкой реальной работы с файловой системой
    - Добавлен e2e тест для полного цикла инициализации, обновления и замены правил
    - Добавлены вспомогательные утилиты для работы с временными директориями и фикстурами
    - Общее покрытие: 427 строк тестового кода
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/a9222eca12cfec6915d3b048c191f668353d66c8" target="_blank">a9222ec</a>

### Changed

- **Обновление конфигурации тестов**
    - Настроено разделение unit и e2e тестов через переменную окружения TEST_TYPE
    - Добавлен скрипт test:coverage для проверки покрытия кода
    - Обновлена конфигурация vitest для корректной работы с различными типами тестов
    - Исключены e2e тесты из coverage отчетов
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/d120e11d18725f03d7fa820ad29a08b234b42f99" target="_blank">d120e11</a>

## [0.1.5] - 2025-11-01

<small>01.11.2025 23:09</small>

### Changed

- **Рефакторинг определения директории пакета**
    - Вынесена логика определения директории пакета в отдельный модуль `get-package-dir.ts`
    - Улучшена читаемость и тестируемость кода CLI модуля
    - Добавлены unit-тесты для функции `getPackageDir` с покрытием различных сценариев (production/development окружения, относительные пути)
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/60c8ddda33a039424a0607d37ce95bb288f5ce2c" target="_blank">60c8ddd</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/fdaf0ada0c67496ebcd206b1841d2c3b6545f9c0" target="_blank">fdaf0ad</a>

- **Обновление зависимостей**
    - Обновлен yarn.lock для зависимостей citty и picocolors
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/4e6a550b6f393162d771264d19e8eac2cd3d5015" target="_blank">4e6a550</a>

## [0.1.4] - 2025-11-01

<small>01.11.2025 22:34</small>

### Changed

- **Миграция с fs-extra на нативный node:fs/promises**
    - Полностью переведены модули file-operations и version-manager на нативные API Node.js
    - Устранена зависимость от fs-extra, что исключает CommonJS/ESM конфликты
    - Добавлена функция pathExists для проверки существования файлов
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/17fa59f80ce4c89cfb2cc91a5e3b8ccd82ed8655" target="_blank">17fa59f</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/4aa9d7dd776ab8b13e136865f3c1321d96d2abf5" target="_blank">4aa9d7d</a>

- **Миграция CLI с commander на citty**
    - Переход на современный типобезопасный CLI builder из экосистемы UnJS
    - Поддержка async commands из коробки
    - Улучшенная структура команд с использованием defineCommand
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/a98fa5b6eea92e2ce69659b18c3c415047fa6123" target="_blank">a98fa5b</a>

- **Обновление зависимостей**
    - Добавлены citty ^0.1.6 и picocolors ^1.1.0
    - Удалена зависимость fs-extra (заменена на node:fs/promises)
    - picocolors обеспечивает безопасность (chalk 5.6.1 был скомпрометирован в сентябре 2025) и производительность (2x быстрее, 14x легче)
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/9e0a9fff7fbcc4ed4e7cd2d748b81a669af41b1b" target="_blank">9e0a9ff</a>

- **Обновление документации**
    - Актуализирована package-ai-docs.md с описанием новых зависимостей (citty, picocolors)
    - Обновлены context7_refs с указанием актуальных зависимостей
    - Добавлены преимущества использования нативного node:fs/promises
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/1e874257d98c788bef8af146ddb632fe1371c2d1" target="_blank">1e87425</a>

## [0.1.3] - 2025-11-01

<small>01.11.2025 15:54</small>

### Changed

- **Обновление версии**
    - Обновлена версия пакета до 0.1.3
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/2e5f27d2fa767086392c2ed502b622b98295c1ac" target="_blank">2e5f27d</a>

## [0.1.2] - 2025-11-01

<small>01.11.2025 15:42</small>

### Changed

- **Обновление версии**
    - Обновлена версия пакета до 0.1.2
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/a389fdbb154c5a4cf56430b7a5d87ecc27c212ad" target="_blank">a389fdb</a>

## [0.1.1] - 2025-11-01

<small>01.11.2025 15:25</small>

### Added

- **CLI инструмент для управления правилами**
    - Добавлен исходный код CLI инструмента для управления правилами Cursor IDE
    - Реализованы команды: `init`, `update`, `replace-all`
    - Добавлена обработка копирования правил и версионирования
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/5c291e898c41d5eaa824f467d4c6cd37fb3af05e" target="_blank">5c291e8</a>

- **Документация и архитектура**
    - Добавлена AI-документация и описание архитектуры проекта
    - Добавлены значки версии и лицензии в README
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/bca41125b9f291d1d4bb7e71b1e0dcd7c3de1be5" target="_blank">bca4112</a>

- **Пользовательские правила и шаблоны**
    - Добавлена папка `user-rules/` с персональными настройками
    - Добавлены шаблоны для meta-info с поддержкой переменных
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/7d5d704fe6ef6e907df1c01879980aded3958508" target="_blank">7d5d704</a>

- **Система планирования и классификации задач**
    - Добавлен режим планирования с активатором и детальными инструкциями
    - Добавлен диспетчер задач для классификации и маршрутизации workflow
    - Добавлена система нумерации P{n}--S{n}--T{n} с модификаторами
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/8a1c782e4ff3253e9d93b8f2d26a0e0d18218f67" target="_blank">8a1c782</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/6a23c721f5954bb2c56632371c276718757ad4c5" target="_blank">6a23c72</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/9a32e0acd8adc4e845aafb119de3c31e19255956" target="_blank">9a32e0a</a>

### Changed

- **Рефакторинг структуры правил и workflow**
    - Разделены правила на compact версии для оптимизации производительности
    - Обновлены compact версии правил код-стандартов и именования
    - Упрощены workflow агента и протокол валидации
    - Усилена обязательная валидация в agent-mode
    - Усилен протокол инициализации chat-mode-router
    - Переименованы файлы правил для улучшения порядка приоритета выполнения
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/29f858f5a3428796c03d349c860bd1d2a78a8c97" target="_blank">29f858f</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/71a6efe4b80914819ddbe37478cd373b9d9f91ee" target="_blank">71a6efe</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/9481c41de330a9238cd8b04a5fca94953fd50c25" target="_blank">9481c41</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/816b2e89174aa992c713f545b16ce08291012ca7" target="_blank">816b2e8</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/4395dbc6dc19ddd33e7e8e2531eb9b345fa3e7dd" target="_blank">4395dbc</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/effea6f66643393e5506fbaa54b0cbb00c917206" target="_blank">effea6f</a>

- **Улучшения документации**
    - Обновлена документация стандартов кода, именования и тестирования
    - Обновлен prompt-workflow и добавлена compact версия
    - Переведены заголовки правил workflow, AI шаблонов и архитектурной документации на английский
    - Обновлены описания режимов работы системы (Plan Mode, Agent Mode)
    - Обновлена команда анализа агента с требованиями к краткости
    - Улучшена документация команды commit с ограничением длины
    - Добавлены примечания о валидации и уточнены требования к выполнению команд
    - Обновлены пути к файлам и структура каталога правил
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/0e70bf4986a1a8c1d921b71a425afa14523423ce" target="_blank">0e70bf4</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/38ef7cbfd32f0cf7356be0956b098e231085d114" target="_blank">38ef7cb</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/06cd7f508bcbbc7fb9ed6feb427729c65e78bded" target="_blank">06cd7f5</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/c85ddf45fc4e83efe0993bf0e682727cb2fced96" target="_blank">c85ddf4</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/4e7d99dfdd00f540577c5eaec39b39d75a0859f3" target="_blank">4e7d99d</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/0b6e5678bfde34d9a28d3591d6b42fc3077eff00" target="_blank">0b6e567</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/ac8e4d1f854838eff8eea9b38b6107e3b0a201d7" target="_blank">ac8e4d1</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/33e567910ab0c533fee084b5e46da81aac278ab7" target="_blank">33e5679</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/80eb7ea066a7a759e3e1ded6d65586ec5fe7d852" target="_blank">80eb7ea</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/0b82fe9bcb3888e88fdaf880036de4a212280056" target="_blank">0b82fe9</a>

- **Обновления конфигурации проекта**
    - Переименован пакет и обновлены ссылки в package.json для CLI инструмента
    - Обновлена конфигурация проекта и зависимости
    - Обновлена команда e2e тестирования в конфигурации GitHub Actions
    - Удалены внешние зависимости из конфигурации сборки
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/12f6af201b0f4c2f41e8b8284a0f69b8df0473c7" target="_blank">12f6af2</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/c14b03734b4e34115a041d8776a8dfed8ced6fba" target="_blank">c14b037</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/a0717c01da3763b363c2ea09a071591ff85f2015" target="_blank">a0717c0</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/9fb28d81182c2903b4712214173c3474eafa81f0" target="_blank">9fb28d8</a>

- **Улучшения prompt-workflow и валидации**
    - Добавлены комплексные улучшения prompt-workflow
    - Обновлены триггеры чтения документации и добавлена блокирующая проверка перед изменением файлов
    - Обновлена документация по архитектуре FSD и FSD Standard
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/6503263ffa4f5bb29dcd9dd04214afda296f66f7" target="_blank">6503263</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/edb06db226a37dabcfc1055fa5e8531787098035" target="_blank">edb06db</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/dedb50aa3dc3cd8e52ac0e6ce9bfa1da4838927e" target="_blank">dedb50a</a>

- **Система нумерации и правила именования**
    - Обновлена система нумерации в workflow на новую схему P{n}--S{n}--T{n}
    - Добавлены новые правила именования для проектов и репозиториев в kebab-case
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/e1734749fd00c23128da23660002c2baf29183e1" target="_blank">e173474</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/89dd284ed9eef305bc431003ac8873df4badf0ed" target="_blank">89dd284</a>

- **Улучшения команды commit**
    - Улучшена команда commit с приоритетным извлечением команд качества
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/5cc6301f5b37ab054caabf625284e2bf5c2cb1de" target="_blank">5cc6301</a>

### Fixed

- **Исправления в правилах и структуре**
    - Исправлен id файла code-workflow.mdc с plan-mode-v3 на code-workflow
    - Обновлен каталог правил с новой нумерацией файлов
    - Исправлено название auxiliary-dev-workflow
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/4fd30a9339586ab7b4e90b4cdea90637531807c1" target="_blank">4fd30a9</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/0e41206ea940ef53ffb870cde561e5a0f13a6459" target="_blank">0e41206</a>

### Removed

- **Очистка устаревших файлов**
    - Удалены устаревшие файлы правил (plan-mode-activator.mdc, rules-navigator.mdc, ask-dispatcher.mdc, compact-prompts-best-practices.mdc)
    - Удалены устаревшие поля frontmatter из файлов
    - Удален файл numbering-system-syntax.md
    - Переименован rules-catalog.mdc в rules-catalog.md
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/b0106bafe65887392f0fbeff79477f04140bb95a" target="_blank">b0106ba</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/0faa2fcffbcbd99e3d5834a1a6259d7a89d18f7e" target="_blank">0faa2fc</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/2c9e8a23c6f682527c83c2fc4cc0c20c6981c432" target="_blank">2c9e8a2</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/b69fd61826162c39239cbdf9bb568a051f2b110a" target="_blank">b69fd61</a>

### Style

- **Улучшения форматирования**
    - Исправлено форматирование и отступы в core-system-instructions.md
    - Добавлены исключения для тестовых файлов в стандарты кода
    - Улучшено форматирование документации
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/ef2a8247bdfb9f6d9d05689e78bf04575a982593" target="_blank">ef2a824</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/a4ae0089c56638f0cc80632ab90f68dc407d315b" target="_blank">a4ae008</a>
    - <a href="https://github.com/CyberWalrus/cursor-rules-cli/commit/585196b89c6400d17a231177abba9e557a529e9c" target="_blank">585196b</a>

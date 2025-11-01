# Changelog

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

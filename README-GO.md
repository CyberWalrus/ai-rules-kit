# cursor-rules-cli (Go версия)

CLI инструмент для управления правилами Cursor IDE в проектах. Переписан на Go для улучшения производительности и отсутствия зависимости от Node.js.

## Установка

### Через npm

```bash
npm i -g cursor-rules-cli
```

### Через Homebrew

```bash
brew install user/tap/cursor-rules-cli
```

### Из исходников

```bash
git clone https://github.com/CyberWalrus/cursor-rules-cli.git
cd cursor-rules-cli
make build
sudo make install
```

## Использование

### Инициализация правил

```bash
cursor-rules-cli init
```

Скачивает последнюю версию правил из GitHub и создает конфигурацию `.cursor/cursor-rules-config.json`.

### Полная замена правил

```bash
cursor-rules-cli replace-all
```

Удаляет старые правила и заменяет их на последнюю версию без сохранения пользовательских изменений.

### Инкрементальное обновление

```bash
cursor-rules-cli upgrade
```

Обновляет только измененные файлы, сохраняя пользовательские изменения и применяя переопределения из конфигурации.

## Конфигурация

Конфигурация хранится в `.cursor/cursor-rules-config.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/CyberWalrus/cursor-rules-cli/main/.cursor/cursor-rules-config-1.0.0.schema.json",
  "cliVersion": "0.4.1",
  "configVersion": "1.0.0",
  "installedAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T12:30:00.000Z",
  "source": "cursor-rules",
  "promptsVersion": "2025.11.7.1",
  "settings": {
    "language": "ru"
  },
  "ruleSets": [
    {
      "id": "base",
      "update": true,
      "fixedVersion": "2025.11.7.1"
    }
  ],
  "ignoreList": [
    "rules/custom-project-rule.mdc"
  ],
  "fileOverrides": [
    {
      "file": "rules/code-standards.mdc",
      "yamlOverrides": {
        "alwaysApply": true,
        "priority": 10
      }
    }
  ]
}
```

## Переменные окружения

- `GITHUB_TOKEN` - опциональный токен для GitHub API (увеличивает лимит запросов с 60 до 5000 в час)

## Сборка

### Локальная сборка

```bash
make build
```

### Сборка для всех платформ

```bash
make build-all
```

Бинарные файлы будут созданы в директории `bin/`.

## Тестирование

```bash
# Все тесты
make test

# Только unit тесты
make test-unit

# Интеграционные тесты
make test-integration
```

## Разработка

### Структура проекта

```
cmd/
  cursor-rules-cli/
    main.go              # Точка входа
internal/
  commands/              # Команды CLI
  config/                # Работа с конфигурацией
  fileops/               # Операции с файлами
  github/                # GitHub API
  version/               # Управление версиями
  ui/                    # UI и интерактивность
  helpers/               # Вспомогательные функции
```

### Зависимости

- `github.com/spf13/cobra` - CLI фреймворк
- `gopkg.in/yaml.v3` - парсинг YAML
- `github.com/gobwas/glob` - glob паттерны
- `github.com/fatih/color` - цветной вывод

## Лицензия

MIT


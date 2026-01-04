import { defineConfig } from 'vitest/config';

/** Проверка типа тестов для условной конфигурации */
const isE2E: boolean = process.env.TEST_TYPE === 'e2e';

/** Конфигурация Vitest для проекта */
export default defineConfig({
    test: {
        coverage: {
            exclude: ['node_modules/', 'src/**/*.test.ts', 'src/**/*.e2e.test.ts', 'src/**/*.d.ts'],
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                global: {
                    branches: 90,
                    functions: 90,
                    lines: 90,
                    statements: 90,
                },
            },
        },
        env: {
            NODE_ENV: 'test',
        },
        environment: 'node',
        exclude: ['node_modules', 'dist', ...(isE2E ? [] : ['**/*.e2e.test.ts'])],
        globals: true,
        include: isE2E ? ['src/**/*.e2e.test.ts'] : ['src/**/*.test.ts'],
        setupFiles: ['src/test-setup.ts'],
        ...(isE2E && {
            fileParallelism: false,
            isolate: true,
            maxConcurrency: 1,
            testTimeout: 30_000,
            threads: false,
        }),
    },
});

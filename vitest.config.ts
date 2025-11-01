import { defineConfig } from 'vitest/config';

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
        exclude: ['node_modules', 'dist'],
        globals: true,
        include: process.env.TEST_TYPE === 'e2e' ? ['src/**/*.e2e.test.ts'] : ['src/**/*.test.ts'],
        setupFiles: ['src/test-setup.ts'],
    },
});

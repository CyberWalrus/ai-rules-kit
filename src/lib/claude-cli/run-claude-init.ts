import { spawn } from 'node:child_process';

/**
 * Запускает Claude Code CLI с командой /init
 * @param cwd - Рабочая директория для выполнения команды
 * @returns Promise, который разрешается когда команда завершается
 */
export async function runClaudeInit(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const claudeProcess = spawn('claude', ['/init'], {
            cwd,
            stdio: 'inherit',
        });

        claudeProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Claude CLI exited with code ${code}`));
            }
        });

        claudeProcess.on('error', (error) => {
            reject(error);
        });
    });
}

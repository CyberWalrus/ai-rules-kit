import { spawn } from 'node:child_process';

/** Копирует текст в буфер обмена */
export async function copyToClipboard(text: string): Promise<void> {
    if (text === null || text === undefined) {
        throw new Error('text is required');
    }

    const { platform } = process;

    return new Promise((resolve, reject) => {
        let command: string;
        let args: string[] = [];

        if (platform === 'win32') {
            command = 'clip';
        } else if (platform === 'darwin') {
            command = 'pbcopy';
        } else {
            command = 'xclip';
            args = ['-selection', 'clipboard'];
        }

        const process = spawn(command, args, {
            stdio: ['pipe', 'ignore', 'ignore'],
        });

        process.stdin.write(text, 'utf8');
        process.stdin.end();

        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        process.on('error', (error) => {
            reject(new Error(`Failed to copy to clipboard: ${error.message}`));
        });
    });
}

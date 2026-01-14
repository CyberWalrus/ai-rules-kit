import { stdin as stdinStream, stdout as stdoutStream } from 'node:process';
import { createInterface } from 'node:readline';

/**
 * Читает числовой ввод от пользователя
 * @param maxOption Максимальный номер опции
 * @returns Номер выбранной опции (0-based) или null при отмене
 */
export function readNumberInput(maxOption: number): Promise<number | null> {
    return new Promise((resolve) => {
        const rl = createInterface({
            input: stdinStream,
            output: stdoutStream,
        });

        const ask = (): void => {
            rl.question('Введите номер: ', (answer) => {
                const num = Number.parseInt(answer.trim(), 10);
                if (Number.isNaN(num) || num < 1 || num > maxOption) {
                    console.log(`Пожалуйста, введите число от 1 до ${maxOption}`);
                    ask();
                } else {
                    rl.close();
                    resolve(num - 1); // Конвертируем в 0-based индекс
                }
            });
        };

        rl.on('close', () => {
            resolve(null);
        });

        ask();
    });
}

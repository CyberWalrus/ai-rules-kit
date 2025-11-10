import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

/** Запрашивает подтверждение у пользователя через интерактивный ввод */
export async function askConfirmation(question: string): Promise<boolean> {
    if (question === null || question === undefined || question === '') {
        throw new Error('question is required');
    }

    const rl = createInterface({
        input: stdin,
        output: stdout,
    });

    try {
        const answer = await rl.question(`${question} (y/n): `);
        const normalized = answer.trim().toLowerCase();

        return normalized === 'y' || normalized === 'yes';
    } finally {
        rl.close();
    }
}

import { env, stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

import { t } from '../i18n';

/** Запрашивает подтверждение у пользователя через интерактивный ввод */
export async function askConfirmation(question: string): Promise<boolean> {
    if (question === null || question === undefined || question === '') {
        throw new Error('question is required');
    }

    // В тестовой среде автоматически возвращаем false
    if (env.NODE_ENV === 'test' || env.TEST_TYPE === 'e2e') {
        return false;
    }

    const rl = createInterface({
        input: stdin,
        output: stdout,
    });

    try {
        const answer = await rl.question(t('helpers.confirmation.prompt', { question }));
        const normalized = answer.trim().toLowerCase();

        return normalized === 'y' || normalized === 'yes';
    } finally {
        rl.close();
    }
}

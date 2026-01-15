import { confirm, isCancel } from '@clack/prompts';

/** Запрашивает подтверждение у пользователя через интерактивный выбор */
export async function askConfirmation(question: string): Promise<boolean> {
    if (question === null || question === undefined || question === '') {
        throw new Error('question is required');
    }

    const isConfirmed = await confirm({
        active: 'Да',
        inactive: 'Нет',
        initialValue: false,
        message: question,
    });

    if (isCancel(isConfirmed)) {
        return false;
    }

    return isConfirmed;
}

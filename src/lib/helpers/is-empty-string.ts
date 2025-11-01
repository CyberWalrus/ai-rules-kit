/** Проверяет что строка пустая, null или undefined */
export function isEmptyString(value: string | null | undefined): boolean {
    return value === null || value === undefined || value === '';
}

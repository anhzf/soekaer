export const get = <R = any, T = Record<string, any>>(obj: T, path: string[]): R => path.reduce((acc: any, key) => acc?.[key], obj);

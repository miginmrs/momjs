import { KeysOfType } from 'dependent-type';

export const toCond = <S, X extends S, K>(x: K): X extends S ? K : never => x as X extends S ? K : never;
export const byKey = <T, R, K extends KeysOfType<T, R>>(o: T, k: K): R => o[k] as any;
import { KeysOfType } from 'dependent-type';

export const toCond = <S, X extends S, K, E = never>(x: K): X extends S ? K : E => x as X extends S ? K : E;
export const byKey = <T, R>(o: T, k: KeysOfType<T, R>): R => o[k] as any;
export const subKey = <A, B extends A, T, K = unknown>(k: K & KeysOfType<T, B>): K & KeysOfType<T, A> => k as any;

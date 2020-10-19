import { App, KeysOfType } from 'dependent-type';

export const toCond = <S, X extends S, K, E = never>(x: K) => x as X extends S ? K : E;
export const asCond = <A, B, R>(x: A & R) => x as A extends B ? A : R as A extends B ? B : R;
export const byKey = <T, R>(o: T, k: KeysOfType<T, R>): R => o[k] as any;
export const subKey = <A, B extends A, T, K = unknown>(k: K & KeysOfType<T, B>): K & KeysOfType<T, A> => k as any;
export const toSuperKey = <A, V, k extends KeysOfType<A, V>>(o: A[k]): V => o as any;

import { KeysOfType } from 'dependent-type';
export declare const toCond: <S, X extends S, K, E = never>(x: K) => X extends S ? K : E;
export declare const asCond: <A, B, R>(x: A & R) => A extends B ? B : R;
export declare const byKey: <T, R>(o: T, k: KeysOfType<T, R>) => R;
export declare const keys: <T>(p: T) => <R>(k: KeysOfType<T, R>, o?: T) => R;
export declare const subKey: <A, B extends A, T, K = unknown>(k: K & KeysOfType<T, B>) => K & KeysOfType<T, A>;
export declare const toSuperKey: <A, V, k extends KeysOfType<A, V>>(o: A[k]) => V;

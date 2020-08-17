export type KeysOfTypeObj<O, T> = {
	[K in keyof O]: [O[K]] extends [T] ? K : never
};
export type KeysOfType<O, T> = KeysOfTypeObj<O, T>[keyof O]

export interface TypeFuncs<C, X> { }


declare const INVARIANT_MARKER: unique symbol;
declare const FUN_MARKER: unique symbol;
export declare const BAD_APP_MARKER: unique symbol;


export type Invariant<T> = { [INVARIANT_MARKER](t: T): T };

export type Fun<K extends keyof TypeFuncs<{}, {}>, C = never> = Invariant<[typeof FUN_MARKER, K, C]>;

export type BadApp<F, X> = Invariant<[typeof BAD_APP_MARKER, F, X]>;
export type App<F, X> = [F] extends [Fun<infer K, infer C>] ? TypeFuncs<C, X>[K] : BadApp<F, X>;
export type DependentType<T> = Fun<KeysOfType<TypeFuncs<{}, {}>, T>, any>;

export type keytype = string | number | symbol;

export type AppX<k extends keytype, cim extends { [P in k]: [any, any] }, key extends { [P in k]: keyof TypeFuncs<{}, {}> }, X> = App<Fun<key[k], cim[k][0]>, X> & cim[k][1];
export type DepConstaint<keys extends keytype, dom, cim extends Record<keys, [any, any]>> = {
	[P in keys]: KeysOfType<TypeFuncs<cim[P][0], dom>, cim[P][1]> }

export type FromEntries<K extends keytype, T extends Record<K, [keytype, any]>> = { [P in K]: { [x in T[P][0]]: T[P][1] } }[K];

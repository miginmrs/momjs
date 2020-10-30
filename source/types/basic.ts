import { DepConstaint } from 'dependent-type';
import { Unsubscribable } from 'rxjs';

export type prim = number | string | boolean;

export type eprim = prim | bigint;
export type defined = object | eprim;

export type Json = null | prim | JsonObject;
export type JsonObject = Json[] | { [k in string]?: Json } & { [k in symbol]: unknown };

declare const _: unique symbol;
export type LocalRef<V, i extends number = number> = { $: i, [_]: V };

export type GlobalRef<V> = { id: string, [_]: V };

export type Ref<V> = LocalRef<V> | GlobalRef<V>;

export type TVCDA_CIM = {
  T: [unknown, Json], V: [unknown, defined], C: [unknown, unknown], D: [unknown, unknown], A: [unknown, unknown[]]
};

export type TVCDA = keyof TVCDA_CIM;

export type CDA_Im = Omit<TVCDA_CIM, 'T' | 'V'>;

export type CDA = keyof CDA_Im;

export type TVCDADepConstaint<dom, cim extends TVCDA_CIM> = DepConstaint<TVCDA, dom, cim>;

export type TVCDAKeys = TVCDADepConstaint<unknown, TVCDA_CIM>;

export type ModelData<T> = { data: T, new?: boolean, id?: string } | { data?: undefined, new?: undefined, id: string }

export type ArrKeys = Exclude<keyof any[], number>;

export type TeardownAction = Unsubscribable | (() => void);


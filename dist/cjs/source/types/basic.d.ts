/// <reference types="lodash" />
import { DepConstaint } from 'dependent-type';
import { Unsubscribable } from 'rxjs';
export declare type prim = number | string | boolean;
export declare type eprim = prim | bigint;
export declare type defined = object | eprim;
export declare type Json = null | prim | JsonObject;
export declare type JsonObject = Json[] | {
    [k in string]?: Json;
} & {
    [k in symbol]: unknown;
};
declare const _: unique symbol;
export declare type LocalRef<V, i extends number = number> = {
    $: i;
    [_]: V;
};
export declare type GlobalRef<V> = {
    id: string;
    [_]: V;
};
export declare type Ref<V> = LocalRef<V> | GlobalRef<V>;
export declare type TVCDA_CIM = {
    T: [unknown, Json];
    V: [unknown, defined];
    C: [unknown, unknown];
    D: [unknown, unknown];
    A: [unknown, unknown[]];
};
export declare type TVCDA = keyof TVCDA_CIM;
export declare type CDA_Im = Omit<TVCDA_CIM, 'T' | 'V'>;
export declare type CDA = keyof CDA_Im;
export declare type TVCDADepConstaint<dom, cim extends TVCDA_CIM> = DepConstaint<TVCDA, dom, cim>;
export declare type TVCDAKeys = TVCDADepConstaint<unknown, TVCDA_CIM>;
export declare type ModelData<T> = {
    data: T;
    new?: boolean;
    id?: string;
} | {
    data?: undefined;
    new?: undefined;
    id: string;
};
export declare type ArrKeys = Exclude<keyof any[], number>;
export declare type TeardownAction = Unsubscribable | (() => void);
export {};

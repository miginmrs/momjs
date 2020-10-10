import { combineLatest, TeardownLogic, Observable, OperatorFunction } from 'rxjs';
declare module 'rxjs/operators' {
    function scan<T, R, V>(accumulator: (acc: R | V, value: T, index: number) => R, seed: V): OperatorFunction<T, R>;
}
/** Like combineLatest but emits if the array of observables is empty
 * and completes when and only when one observable completes */
export declare const eagerCombineAll: typeof combineLatest;
export declare const on: <T>({ complete, error, next, subscribe, teardown }: {
    complete?: (() => void) | undefined;
    error?: ((e: any) => void) | undefined;
    next?: ((v: T) => void) | undefined;
    subscribe?: (() => void) | undefined;
    teardown?: void | Function | import("rxjs").Unsubscribable | undefined;
}) => (source: Observable<T>) => Observable<T>;
export declare function current<T>(obs: Observable<T>, value: T): T;
export declare function current<T>(obs: Observable<T | undefined>, value?: T | undefined): T | undefined;

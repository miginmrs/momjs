export declare class QuickPromise<T> implements PromiseLike<T> {
    private _thens;
    private _catchs;
    private _value?;
    private _error?;
    private _promise?;
    private _status;
    private _finilize;
    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void);
    private _tryRun;
    then<R = T, E = never>(onfulfilled?: ((value: T) => R | PromiseLike<R>) | null, onrejected?: ((reason: any) => E | PromiseLike<E>) | null): PromiseLike<R | E>;
    catch<E = never>(onrejected?: ((reason: any) => E | PromiseLike<E>) | null): PromiseLike<E>;
    [Symbol.toStringTag]: '';
    finally(onfinally?: (() => void) | null): PromiseLike<T>;
    static resolve<T>(v: T | PromiseLike<T>): QuickPromise<T>;
    static resolve<T>(v?: T | PromiseLike<T> | undefined): QuickPromise<T | undefined>;
    static reject(e: any): QuickPromise<never>;
    static all<T>(values: readonly (T | PromiseLike<T>)[]): PromiseLike<T[]>;
    static all<O>(values: O): PromiseLike<UnPromise<O>>;
}
declare type UnPromise<O> = {
    [k in keyof O]: O[k] extends PromiseLike<infer T> ? T : O[k];
};
export {};

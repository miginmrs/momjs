export declare type PromiseCtr = {
    new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseLike<T>;
    all<T>(values: readonly (T | PromiseLike<T>)[]): PromiseLike<T[]>;
    resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
};
export declare const runit: <R, N>(gen: Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr) => PromiseLike<R>;
export declare function wait<T>(x: T | PromiseLike<T>): Generator<T | PromiseLike<T>, T, T>;
export declare function asAsync<T extends unknown[], R, U = void, N = unknown>(f: (this: U, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg: U): (...args: T) => PromiseLike<R>;
export declare function asAsync<T extends unknown[], R, U = void, N = unknown>(f: (this: U | void, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg?: U): (...args: T) => PromiseLike<R>;

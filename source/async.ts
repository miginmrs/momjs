export type PromiseCtr = {
  new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseLike<T>;
  all<T>(values: readonly (T | PromiseLike<T>)[]): PromiseLike<T[]>,
  resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
}

export const runit = <R, N>(gen: Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr) => {
  const runThen = (...args: [] | [N]): PromiseLike<R> => {
    const v = args.length ? gen.next(args[0]) : gen.next();
    if (v.done) return promiseCtr.resolve(v.value);
    return promiseCtr.resolve(v.value).then(runThen);
  }; return runThen();
}

export function* wait<T>(x: T | PromiseLike<T>): Generator<T | PromiseLike<T>, T, T> {
  return yield x;
}

export function asAsync<T extends unknown[], R, U = void, N = unknown>(f: (this: U, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg: U): (...args: T) => PromiseLike<R>;
export function asAsync<T extends unknown[], R, U = void, N = unknown>(f: (this: U | void, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg?: U): (...args: T) => PromiseLike<R>;
export function asAsync<T extends unknown[], R, U = void, N = unknown>(f: (this: U, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg: U): (...args: T) => PromiseLike<R> {
  return (...args: T) => runit(f.call(thisArg, ...args as T), promiseCtr);
}


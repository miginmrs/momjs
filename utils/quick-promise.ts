import { identity } from "rxjs";

enum PromiseStatus { Pending, Resolved, Rejected, Alias }

export class QuickPromise<T> implements PromiseLike<T> {
  private _thens: ((x: T) => void)[] = [];
  private _catchs: ((e: any) => void)[] = [];
  private _value?: T;
  private _error?: any;
  private _promise?: PromiseLike<T>;
  private _status = PromiseStatus.Pending;

  private _finilize<U>(list: ((x: U) => void)[]) {
    return (value: U) => {
      list.forEach(h => h(value));
      this._thens = [];
      this._catchs = [];
    };
  }

  constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    executor(valueOrPromise => {
      if (this._status !== PromiseStatus.Pending) return;
      if (((v: any): v is PromiseLike<T> => v?.then)(valueOrPromise)) {
        this._status = PromiseStatus.Alias;
        this._promise = valueOrPromise;
        valueOrPromise.then(this._finilize(this._thens), this._finilize(this._catchs));
      } else {
        const value: T = valueOrPromise!;
        this._value = value;
        this._status = PromiseStatus.Resolved;
        this._finilize(this._thens)(value);
      }
    }, e => {
      if (this._status !== PromiseStatus.Pending) return;
      this._error = e;
      this._status = PromiseStatus.Rejected;
      this._finilize(this._catchs)(e);
    });
  }

  private _tryRun<R>(
    handler: (value: T) => R | PromiseLike<R>,
    resolve: (value: R | PromiseLike<R>) => void,
    reject: (reason?: any) => void,
  ): (x: T) => void {
    return (x: T) => {
      try {
        const valueOrPromise = handler(x);
        if (((v: any): v is PromiseLike<R> => v?.then)(valueOrPromise)) {
          valueOrPromise.then(resolve, reject);
        } else {
          const value: R = valueOrPromise;
          resolve(value);
        }
      } catch (e) {
        reject(e);
      }
    };
  }
  then<R = T, E = never>(
    onfulfilled?: ((value: T) => R | PromiseLike<R>) | null,
    onrejected?: ((reason: any) => E | PromiseLike<E>) | null
  ): PromiseLike<R | E> {
    const onfulfilled2 = onfulfilled ?? identity as unknown as (value: T) => R;
    return new QuickPromise<R | E>((res, rej) => {
      if (this._status === PromiseStatus.Pending) {
        this._thens.push(this._tryRun(onfulfilled2, res, rej));
        if (onrejected) this._catchs.push(this._tryRun(onrejected, res, rej));
        else this._catchs.push(rej);
      } else if (this._status === PromiseStatus.Alias) {
        const promise = this._promise!;
        promise.then(
          this._tryRun(onfulfilled2, res, rej),
          onrejected ? this._tryRun(onrejected, res, rej) : rej,
        );
      } else if (this._status === PromiseStatus.Resolved) {
        this._tryRun(onfulfilled2, res, rej)(this._value!);
      } else {
        if (onrejected) this._tryRun(onrejected, res, rej)(this._error!);
        else rej(this._error!);
      }
    });
  }
  catch<E = never>(
    onrejected?: ((reason: any) => E | PromiseLike<E>) | null
  ): PromiseLike<E> {
    return this.then(null, onrejected);
  }
  [Symbol.toStringTag]: '';
  finally(
    onfinally?: (() => void) | null
  ): PromiseLike<T> {
    if (!onfinally) return this;
    const handler = () => { try { onfinally(); } catch (_e) { } };
    if (this._status === PromiseStatus.Alias) this._promise!.then(handler, handler);
    else if (this._status === PromiseStatus.Pending) this._thens.push(handler), this._catchs.push(handler);
    else handler();
    return this;
  }
  static resolve<T>(v: T | PromiseLike<T>): QuickPromise<T>;
  static resolve<T>(v?: T | PromiseLike<T> | undefined): QuickPromise<T | undefined>;
  static resolve<T>(v: T | PromiseLike<T>) {
    return new QuickPromise<T>(res => res(v));
  }

  static reject(e: any) {
    return new QuickPromise<never>((_, rej) => rej(e));
  }

  static all<T>(values: readonly (T | PromiseLike<T>)[]): PromiseLike<T[]>;
  static all<O>(values: O): PromiseLike<UnPromise<O>>;
  static all<O>(p: O): PromiseLike<UnPromise<O>> {
    const result = (p instanceof Array ? [...p] : { ...p }) as UnPromise<O>;
    const keys = (Object.keys(p) as (keyof O)[]).filter(k => (p[k] as any).then);
    let count = keys.length;
    return new QuickPromise<UnPromise<O>>((res, rej) => {
      if (!count) res(result);
      keys.forEach(<k extends keyof O>(k: k) => {
        const promise = (p[k] as any as PromiseLike<O[k] extends PromiseLike<infer T> ? T : never>);
        promise.then<void, void>(x => {
          result[k] = x;
          if (!--count) res(result);
        }, rej);
      });
    });
  }
}
type UnPromise<O> = {
  [k in keyof O]: O[k] extends PromiseLike<infer T> ? T : O[k]
};
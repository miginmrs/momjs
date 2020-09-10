import { combineLatest, of, TeardownLogic, Subscriber, Observable, Subscription, OperatorFunction } from 'rxjs';
import { CombineLatestSubscriber, CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';

declare module 'rxjs/operators' {
  export function scan<T, R, V>(accumulator: (acc: R | V, value: T, index: number) => R, seed: V): OperatorFunction<T, R>;
}

class CompleteDestination<T> extends Subscriber<T> {
  notifyComplete() { this.destination.complete?.(); }
}

export const combine: typeof combineLatest = function (this: any, ...args: any[]) {
  if (args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0) return of([]);
  const obs = combineLatest.apply(this, args);
  (obs.operator as CombineLatestOperator<any, any>).call = function (sink, source) {
    const subscriber: CombineLatestSubscriber<any, any> = CombineLatestOperator.prototype.call(sink, source);
    subscriber.notifyComplete = CompleteDestination.prototype.notifyComplete;
  }
  return obs;
} as any;

export const on = <T>({ complete, error, next, subscribe, teardown }: {
  complete?: () => void, error?: (e: any) => void, next?: (v: T) => void, subscribe?: () => void, teardown?: TeardownLogic
}) => (source: Observable<T>) => source.lift<T>(function (this: Subscriber<T>, source: Observable<T>) {
  const subscriber = this;
  subscribe?.();
  const subscription = new Subscription();
  subscription.add(source.subscribe(v => {
    next?.(v);
    subscriber.next(v)
  }, e => {
    error?.(e);
    subscriber.error(e)
  }, () => {
    complete?.();
    subscriber.complete();
  }));
  subscription.add(teardown);
  return subscription;
});

export function current<T>(obs: Observable<T>, value: T): T;
export function current<T>(obs: Observable<T | undefined>, value?: T | undefined): T | undefined;
export function current<T>(obs: Observable<T>, value: T) {
  obs.subscribe(v => value = v).unsubscribe();
  return value;
}
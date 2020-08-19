import { combineLatest, of, TeardownLogic, Subscriber, Observable, Subscription } from 'rxjs';

export const combine: typeof combineLatest = function (this: any, ...args: any[]) {
  if (args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0) return of([]);
  return combineLatest.apply(this, args);
} as any;

export const on = <T>({ complete, error, next, subscribe, teardown }: {
  complete?: () => void, error?: (e: any) => void, next?: (v: T) => void, subscribe?: ()=>void, teardown?: TeardownLogic
}) => (source: Observable<T>) => source.lift<T>(function(this: Subscriber<T>, source: Observable<T>){
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
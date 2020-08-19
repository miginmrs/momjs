import { BehaviorSubject, Observable, Subscription, TeardownLogic } from 'rxjs';
import { alternMap } from 'altern-map';
import { combine } from '../utils/rx-utils';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
type TwoDestructable<A extends any[]> = Destructable<A[keyof A], any, any, any>[] & {
  [k in keyof A]: Destructable<A[k], any, any, any>;
};
export type DeepDestructable<A extends any[], n extends 1 | 2 = 1> = Destructable<A[keyof A], any, any, any>[] & {
  [k in keyof A]: n extends 1 ? Destructable<A[k], any, any, any> : TwoDestructable<A[k] & any[]>;
};
export type EntryObs<D, A extends any[]> = {
  args: DeepDestructable<A>, data: D
};

export const destructableCmp = <D, A extends any[]>({
  compareData = (x: D, y: D) => x === y,
  compareObs = <i extends number>(x: Destructable<A[i], any, any, any>, y: Destructable<A[i], any, any, any>) => x === y
} = {}) => (
  x: EntryObs<D, A>, y: EntryObs<D, A>
) => x.args.length === y.args.length && x.args.every((v, i) => compareObs(v, y.args[i])) && compareData(x.data, y.data);

export class Destructable<T, C, D, A extends any[]> extends Observable<T> {
  readonly subject: BehaviorSubject<EntryObs<D, A>>;
  private destroy: Subscription
  readonly addTearDown: (teardown: TeardownLogic) => Subscription;
  get destroyed() { return this.destroy.closed }
  source: Observable<T>;
  origin = this;
  constructor(readonly ctr: (args: A, data: D, c: C) => T, readonly c: C, init: EntryObs<D, A>, compare = destructableCmp<D, A>()) {
    super();
    this.subject = new BehaviorSubject(init);
    this.destroy = new Subscription(() => this.subject.unsubscribe());
    this.addTearDown = this.destroy.add.bind(this.destroy);
    this.source = new Observable<T>(subscriber => {
      const subs = this.subject.pipe(
        distinctUntilChanged(compare),
        alternMap(({ args, data }) => combine<A>(args).pipe(map(args => ctr(args, data, c))))
      ).subscribe(subscriber);
      subs.add(this.destroy);
      return subs;
    });
    this.operator = shareReplay({ bufferSize: 1, refCount: true })(this).operator;
  }
}

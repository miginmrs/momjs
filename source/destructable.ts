import { BehaviorSubject, Observable, Subscription, TeardownLogic } from 'rxjs';
import { alternMap } from 'altern-map';
import { combine } from '../utils/rx-utils';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { RequestHandler, TVCDA_CIM, TVCDADepConstaint } from './types';
import { AppX } from 'dependent-type';
type TwoDestructable<A extends any[]> = TypedDestructable<A[keyof A]>[] & {
  [k in keyof A]: TypedDestructable<A[k]>;
};
export type DeepDestructable<A extends any[], n extends 1 | 2 = 1> = TypedDestructable<A[keyof A]>[] & {
  [k in keyof A]: n extends 1 ? TypedDestructable<A[k]> : TwoDestructable<A[k] & any[]>;
};
export type EntryObs<D, A extends any[]> = {
  args: DeepDestructable<A>, data: D
};

export const destructableCmp = <D, A extends any[]>({
  compareData = (x: D, y: D) => x === y,
  compareObs = <i extends number>(x: TypedDestructable<A[i]>, y: TypedDestructable<A[i]>) => x === y
} = {}) => (
  x: EntryObs<D, A>, y: EntryObs<D, A>
) => x.args.length === y.args.length && x.args.every((v, i) => compareObs(v, y.args[i])) && compareData(x.data, y.data);
export type TypedDestructable<V> = XDestructable<any, any, any, any> & Observable<V>;
export class XDestructable<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom> extends Observable<AppX<'V', cim, k, X>> {
  readonly subject: BehaviorSubject<EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>>>;
  private destroy: Subscription
  readonly addTearDown: (teardown: TeardownLogic) => Subscription;
  get destroyed() { return this.destroy.closed }
  source: Observable<AppX<'V', cim, k, X>>;
  origin = this;
  constructor(readonly handler: RequestHandler<dom, cim, k>, readonly c: AppX<'C', cim, k, X>, init: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>>, compare = destructableCmp<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>>()) {
    super();
    this.subject = new BehaviorSubject(init);
    this.destroy = new Subscription(() => this.subject.unsubscribe());
    this.addTearDown = this.destroy.add.bind(this.destroy);
    this.source = new Observable<AppX<'V', cim, k, X>>(subscriber => {
      const subs = this.subject.pipe(
        distinctUntilChanged(compare),
        alternMap(({ args, data }) => combine<AppX<'A', cim, k, X>>(args).pipe(map(args => handler.ctr(args, data, c))))
      ).subscribe(subscriber);
      subs.add(this.destroy);
      return subs;
    });
    this.operator = shareReplay({ bufferSize: 1, refCount: true })(this).operator;
  }
}

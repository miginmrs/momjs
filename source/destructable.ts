import { BehaviorSubject, Observable, Subscription, TeardownLogic } from 'rxjs';
import { alternMap } from 'altern-map';
import { eagerCombineAll } from '../utils/rx-utils';
import { map, shareReplay, distinctUntilChanged, scan, tap } from 'rxjs/operators';
import { TVCDA_CIM, TVCDADepConstaint, EHConstraint, CtxEH, RequestHandlerCompare, ObsWithOrigin, ArrKeys } from './types';
import type { AppX, KeysOfType } from 'dependent-type';
import { byKey } from '../utils/guards';
import '../utils/rx-utils'

export type TwoDestructable<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = ObsWithOrigin<A[number], EH, ECtx>[] & {
  [k in Exclude<keyof A, keyof any[]>]: ObsWithOrigin<A[k], EH, ECtx>;
};

export type DeepDestructable<A extends unknown[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = (n extends 1 ? ObsWithOrigin<A[number], EH, ECtx> : TwoDestructable<A[number] & unknown[], EH, ECtx>)[] & {
  [k in Exclude<keyof A, keyof any[]>]: n extends 1 ? ObsWithOrigin<A[k], EH, ECtx> : TwoDestructable<A[k] & unknown[], EH, ECtx>;
};
export type EntryObs<D, A extends unknown[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  args: DeepDestructable<A, n, EH, ECtx>, data: D, n: n
};

export const destructableCmp = <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx>({
  compareData = <X extends dom>(x: AppX<'D', cim, k, X>, y: AppX<'D', cim, k, X>) => x === y,
  compareObs = <X extends dom, i extends number>(x: ObsWithOrigin<AppX<'A', cim, k, X>[i], EH, ECtx>, y: ObsWithOrigin<AppX<'A', cim, k, X>[i], EH, ECtx>) => x === y
} = {}): RequestHandlerCompare<dom, cim, k, n, EH, ECtx> => <X extends dom>(
  x: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>, y: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>
) => x.args.length === y.args.length && x.args.every((v, i) => {
  type A = AppX<"A", cim, k, X>;
  type item = ObsWithOrigin<A[number], EH, ECtx> | TwoDestructable<A[number] & unknown[], EH, ECtx>;
  const vItem: item = v, yItem: item = y.args[i];
  if (vItem instanceof Array) {
    if (yItem instanceof Array) return vItem.length === yItem.length && vItem.every(x => x === yItem[i]);
    return false;
  }
  if (yItem instanceof Array) return false;
  return compareObs(vItem, yItem);
}) && compareData(x.data, y.data);

export class Destructable<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx, $V extends (v: AppX<'V', cim, k, X>) => void = (v: AppX<'V', cim, k, X>) => void>
  extends Observable<Parameters<$V>[0]> implements ObsWithOrigin<Parameters<$V>[0], EH, ECtx> {
  readonly subject: BehaviorSubject<EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>>;
  private destroy: Subscription;
  get destroyed() { return this.destroy.closed }
  source: Observable<Parameters<$V>[0]>;
  readonly origin = this;
  readonly parent = this;
  get handler(): CtxEH<dom, cim, k, n, EH, ECtx> {
    return byKey<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>>(this.handlers, this.key);
  }
  add(teardown: TeardownLogic) {
    return this.destroy.add(teardown);
  }
  constructor(
    readonly handlers: EH,
    readonly key: KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>> & string,
    readonly c: AppX<'C', cim, k, X>,
    init: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>,
    compare = destructableCmp<dom, cim, k, n, EH, ECtx>(),
    ...teardownList: TeardownLogic[]
  ) {
    super();
    type C = AppX<'C', cim, k, X>;
    type D = AppX<'D', cim, k, X>;
    type A = AppX<'A', cim, k, X>;
    type V = Parameters<$V>[0];
    const handler = this.handler;
    this.subject = new BehaviorSubject(init);
    this.destroy = new Subscription(() => {
      if (!this.subject.isStopped) this.subject.unsubscribe();
      else this.subject.closed = true;
    });
    teardownList.forEach(cb => this.destroy.add(cb));
    this.source = new Observable<V>(subscriber => {
      const subs = this.subject.pipe(
        distinctUntilChanged(compare),
        alternMap(({ args, data }) => {
          const array = args.map(args => args instanceof Array ? eagerCombineAll(args) : args);
          return (eagerCombineAll(array) as Observable<A>).pipe(
            map(args => [args, data, c] as [A, D, C]),
          )
        }, { completeWithInner: true, completeWithSource: true }),
        tap({ error: err => this.subject.error(err), complete: () => this.subject.complete() }),
        scan<[A, D, C], V, null>((old, [args, data, c]) => handler.ctr(args, data, c, old, this), null)
      ).subscribe(subscriber);
      subs.add(this.destroy);
      return subs;
    });
    this.operator = shareReplay({ bufferSize: 1, refCount: true })(this).operator;
  }
}

import { BehaviorSubject, Observable, Subscription, TeardownLogic } from 'rxjs';
import { alternMap } from 'altern-map';
import { combine } from '../utils/rx-utils';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { TVCDA_CIM, TVCDADepConstaint, CtxH, EHConstraint, CtxEH, DestructableCtr, RequestHandlerCompare, ObsWithOrigin } from './types';
import { AppX, KeysOfType } from 'dependent-type';
import { byKey } from '../utils/guards';

type TwoDestructable<A extends any[], EH extends EHConstraint<EH, ECtx>, ECtx> = TypedDestructable<A[keyof A & number], EH, ECtx>[] & {
  [k in keyof A & number]: TypedDestructable<A[k], EH, ECtx>;
};
export type DeepDestructable<A extends any[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = TypedDestructable<A[keyof A & number], EH, ECtx>[] & {
  [k in keyof A & number]: n extends 1 ? TypedDestructable<A[k], EH, ECtx> : TwoDestructable<A[k] & any[], EH, ECtx>;
};
export type EntryObs<D, A extends any[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  args: DeepDestructable<A, n, EH, ECtx>, data: D, n: n
};

export const destructableCmp = <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx>({
  compareData = <X extends dom>(x: AppX<'D', cim, k, X>, y: AppX<'D', cim, k, X>) => x === y,
  compareObs = <X extends dom, i extends number>(x: TypedDestructable<AppX<'A', cim, k, X>[i], EH, ECtx>, y: TypedDestructable<AppX<'A', cim, k, X>[i], EH, ECtx>) => x === y
} = {}): RequestHandlerCompare<dom, cim, k, n, EH, ECtx> => <X extends dom>(
  x: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>, y: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>
) => x.args.length === y.args.length && x.args.every((v, i) => compareObs(v, y.args[i])) && compareData(x.data, y.data);
export type TypedDestructable<V, EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<any, any, any, any, any, EH, ECtx> & Observable<V>;

export class Destructable<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> extends Observable<AppX<'V', cim, k, X>> implements ObsWithOrigin<AppX<'V', cim, k, X>, EH, ECtx> {
  readonly subject: BehaviorSubject<EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>>;
  private destroy: Subscription
  get destroyed() { return this.destroy.closed }
  source: Observable<AppX<'V', cim, k, X>>;
  readonly origin = this;
  readonly parent = this;
  get handler() { return byKey<EH, CtxEH<dom, cim, k, n, EH, ECtx>>(this.handlers, this.key); }
  constructor(
    readonly handlers: EH,
    readonly key: KeysOfType<EH, CtxEH<dom, cim, k, n, EH, ECtx>> & string,
    readonly c: AppX<'C', cim, k, X>,
    init: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>,
    compare = destructableCmp<dom, cim, k, n, EH, ECtx>(),
    ...teardownList: TeardownLogic[]
  ) {
    super();
    const handler = byKey<EH, CtxEH<dom, cim, k, n, EH, ECtx>>(handlers, key);
    this.subject = new BehaviorSubject(init);
    this.destroy = new Subscription(() => this.subject.unsubscribe());
    teardownList.forEach(cb => this.destroy.add(cb));
    this.source = new Observable<AppX<'V', cim, k, X>>(subscriber => {
      const subs = this.subject.pipe(
        distinctUntilChanged(compare),
        alternMap(({ args, data, n }) => combine<AppX<'A', cim, k, X>>(n === 2
          ? args.map(combine) : args).pipe(map(args => handler.ctr(args, data, c))))
      ).subscribe(subscriber);
      subs.add(this.destroy);
      return subs;
    });
    this.operator = shareReplay({ bufferSize: 1, refCount: true })(this).operator;
  }
}

import { BehaviorSubject, Observable, Subscription, TeardownLogic } from 'rxjs';
import { alternMap } from 'altern-map';
import { combine } from '../utils/rx-utils';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { TVCDA_CIM, TVCDADepConstaint, CtxH, EHConstraint } from './types';
import { AppX, KeysOfType } from 'dependent-type';
type TwoDestructable<A extends any[], EH extends EHConstraint<EH, ECtx>, ECtx> = TypedDestructable<A[keyof A], EH, ECtx>[] & {
  [k in keyof A]: TypedDestructable<A[k], EH, ECtx>;
};
export type DeepDestructable<A extends any[], EH extends EHConstraint<EH, ECtx>, ECtx, n extends 1 | 2 = 1> = TypedDestructable<A[keyof A], EH, ECtx>[] & {
  [k in keyof A]: n extends 1 ? TypedDestructable<A[k], EH, ECtx> : TwoDestructable<A[k] & any[], EH, ECtx>;
};
export type EntryObs<D, A extends any[], EH extends EHConstraint<EH, ECtx>, ECtx> = {
  args: DeepDestructable<A, EH, ECtx>, data: D
};

export const destructableCmp = <D, A extends any[], EH extends EHConstraint<EH, ECtx>, ECtx>({
  compareData = (x: D, y: D) => x === y,
  compareObs = <i extends number>(x: TypedDestructable<A[i], EH, ECtx>, y: TypedDestructable<A[i], EH, ECtx>) => x === y
} = {}) => (
  x: EntryObs<D, A, EH, ECtx>, y: EntryObs<D, A, EH, ECtx>
) => x.args.length === y.args.length && x.args.every((v, i) => compareObs(v, y.args[i])) && compareData(x.data, y.data);
export type TypedDestructable<V, EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<any, any, any, any, EH, ECtx> & Observable<V>;

export class Destructable<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> extends Observable<AppX<'V', cim, k, X>> {
  readonly subject: BehaviorSubject<EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx>>;
  private destroy: Subscription
  readonly addTearDown: (teardown: TeardownLogic) => Subscription;
  get destroyed() { return this.destroy.closed }
  source: Observable<AppX<'V', cim, k, X>>;
  origin = this;
  constructor(
    readonly handlers: EH,
    readonly ctr: (args: AppX<'A', cim, k, X>, data: AppX<'D', cim, k, X>, c: AppX<'C', cim, k, X>) => AppX<'V', cim, k, X>, readonly c: AppX<'C', cim, k, X>, init: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx>,
    readonly key: KeysOfType<EH, CtxH<dom, cim, k, EH, ECtx>> & string,
    compare = destructableCmp<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx>()
  ) {
    super();
    this.subject = new BehaviorSubject(init);
    this.destroy = new Subscription(() => this.subject.unsubscribe());
    this.addTearDown = this.destroy.add.bind(this.destroy);
    this.source = new Observable<AppX<'V', cim, k, X>>(subscriber => {
      const subs = this.subject.pipe(
        distinctUntilChanged(compare),
        alternMap(({ args, data }) => combine<AppX<'A', cim, k, X>>(args).pipe(map(args => ctr(args, data, c))))
      ).subscribe(subscriber);
      subs.add(this.destroy);
      return subs;
    });
    this.operator = shareReplay({ bufferSize: 1, refCount: true })(this).operator;
  }
}

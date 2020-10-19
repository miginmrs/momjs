import { BehaviorSubject, Observable, Subscription, TeardownLogic } from 'rxjs';
import { TVCDA_CIM, TVCDADepConstaint, EHConstraint, CtxEH, RequestHandlerCompare, ObsWithOrigin } from './types';
import type { AppX, KeysOfType } from 'dependent-type';
import '../utils/rx-utils';
export declare type TwoDestructable<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = ObsWithOrigin<A[number], EH, ECtx>[] & {
    [k in Exclude<keyof A, keyof any[]>]: ObsWithOrigin<A[k], EH, ECtx>;
};
export declare type DeepDestructable<A extends unknown[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = (n extends 1 ? ObsWithOrigin<A[number], EH, ECtx> : TwoDestructable<A[number] & unknown[], EH, ECtx>)[] & {
    [k in Exclude<keyof A, keyof any[]>]: n extends 1 ? ObsWithOrigin<A[k], EH, ECtx> : TwoDestructable<A[k] & unknown[], EH, ECtx>;
};
export declare type EntryObs<D, A extends unknown[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    args: DeepDestructable<A, n, EH, ECtx>;
    data: D;
    n: n;
};
export declare const destructableCmp: <dom, cim extends TVCDA_CIM, k extends import("dependent-type").DepConstaint<"T" | "V" | "C" | "D" | "A", dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx>({ compareData, compareObs }?: {
    compareData?: (<X extends dom>(x: AppX<"D", cim, k, X>, y: AppX<"D", cim, k, X>) => boolean) | undefined;
    compareObs?: (<X_1 extends dom, i extends number>(x: ObsWithOrigin<AppX<"A", cim, k, X_1>[i], EH, ECtx>, y: ObsWithOrigin<AppX<"A", cim, k, X_1>[i], EH, ECtx>) => boolean) | undefined;
}) => RequestHandlerCompare<dom, cim, k, n, EH, ECtx>;
export declare class Destructable<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx, $V extends (v: AppX<'V', cim, k, X>) => void = (v: AppX<'V', cim, k, X>) => void> extends Observable<Parameters<$V>[0]> implements ObsWithOrigin<Parameters<$V>[0], EH, ECtx> {
    readonly handlers: EH;
    readonly key: KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>> & string;
    readonly c: AppX<'C', cim, k, X>;
    readonly subject: BehaviorSubject<EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>>;
    private destroy;
    get destroyed(): boolean;
    source: Observable<Parameters<$V>[0]>;
    readonly origin: this;
    readonly parent: this;
    get handler(): CtxEH<dom, cim, k, n, EH, ECtx>;
    add(teardown: TeardownLogic): Subscription;
    constructor(handlers: EH, key: KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>> & string, c: AppX<'C', cim, k, X>, init: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>, compare?: RequestHandlerCompare<dom, cim, k, n, EH, ECtx>, ...teardownList: TeardownLogic[]);
}

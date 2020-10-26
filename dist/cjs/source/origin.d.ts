import type { AppX, KeysOfType } from 'dependent-type';
import type { TVCDA_CIM, TVCDADepConstaint, TeardownAction } from './types/basic';
import type { EHConstraint, CtxEH, RequestHandlerCompare, TSerialObs, EntryObs } from './types/serial';
import { BehaviorSubject, Observable, Subscription, TeardownLogic } from 'rxjs';
export declare const compareEntries: <dom, cim extends TVCDA_CIM, k extends import("dependent-type").DepConstaint<"T" | "V" | "C" | "D" | "A", dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx>({ compareData, compareObs }?: {
    compareData?: (<X extends dom>(x: AppX<"D", cim, k, X>, y: AppX<"D", cim, k, X>) => boolean) | undefined;
    compareObs?: (<X_1 extends dom, i extends number>(x: TSerialObs<AppX<"A", cim, k, X_1>[i], EH, ECtx>, y: TSerialObs<AppX<"A", cim, k, X_1>[i], EH, ECtx>) => boolean) | undefined;
}) => RequestHandlerCompare<dom, cim, k, n, EH, ECtx>;
export declare class Origin<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx, $V extends (v: AppX<'V', cim, k, X>) => void = (v: AppX<'V', cim, k, X>) => void> extends Observable<Parameters<$V>[0]> implements TSerialObs<Parameters<$V>[0], EH, ECtx> {
    readonly getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R;
    readonly key: KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>> & string;
    readonly c: AppX<'C', cim, k, X>;
    readonly subject: BehaviorSubject<EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>>;
    private teardown;
    get destroyed(): boolean;
    source: Observable<Parameters<$V>[0]>;
    readonly origin: this;
    readonly parent: this;
    readonly handler: CtxEH<dom, cim, k, n, EH, ECtx>;
    add(teardown: TeardownLogic): Subscription;
    constructor(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R, key: KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>> & string, c: AppX<'C', cim, k, X>, init: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>, compare?: RequestHandlerCompare<dom, cim, k, n, EH, ECtx>, ...teardownList: TeardownAction[]);
}

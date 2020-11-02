import type { AppX } from 'dependent-type';
import type { TVCDA_CIM } from './types/basic';
import type { EHConstraint, SerialObs } from './types/serial';
import { Observable, Subject, Subscription, TeardownLogic } from 'rxjs';
export declare const wrap: <dom, cim extends TVCDA_CIM, k extends import("dependent-type").DepConstaint<"T" | "V" | "C" | "D" | "A", dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx, $V extends (v: AppX<"V", cim, k, X>) => void = (v: AppX<"V", cim, k, X>) => void>(obs: SerialObs<dom, cim, k, X, n, EH, ECtx, $V>, teardown: TeardownLogic, subscribe: () => Subscription, parent?: SerialObs<dom, cim, k, X, n, EH, ECtx, $V> | SerialObs<dom, cim, k, X, n, EH, ECtx, $V>[], subjectFactory?: (this: Observable<AppX<"V", cim, k, X>>) => Subject<AppX<"V", cim, k, X>>) => SerialObs<dom, cim, k, X, n, EH, ECtx, $V>;

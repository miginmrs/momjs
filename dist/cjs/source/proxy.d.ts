import { Store } from './store';
import { Observable, Subject, Subscription } from 'rxjs';
import type { CallHandler, RHConstraint, FkxConstraint, FIDS } from './types/store';
export declare type DataGram<T extends string> = {
    channel: number;
    type: T;
    data: string;
};
export declare type msg1to2 = 'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call';
export declare type msg2to1 = 'response_put' | 'response_id' | 'response_call' | 'call_error' | 'call_complete';
export declare const msg1to2keys: Record<msg1to2, 0>;
export declare const msg2to1keys: Record<msg2to1, 0>;
export declare const startListener: <RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends Record<fIds, [[unknown, import("./types/basic").TVCDA_CIM, 1 | 2], [unknown, import("./types/basic").TVCDA_CIM, 1 | 2], import("./types/basic").Json]>, fkx extends FkxConstraint<fIds, fdcp>, e extends string = never>(store: Store<RH, ECtx, fIds, fdcp, fkx, never, {}, {}>, from: Observable<DataGram<"complete" | "error" | "unsubscribe" | "put" | "call" | "end_call" | e>>, to: {
    next: (x: DataGram<msg2to1>) => void;
}) => Subscription;
export declare const createCallHandler: <RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends Record<fIds, [[unknown, import("./types/basic").TVCDA_CIM, 1 | 2], [unknown, import("./types/basic").TVCDA_CIM, 1 | 2], import("./types/basic").Json]>, fkx extends FkxConstraint<fIds, fdcp>, e extends string = never>(to: {
    next: (x: DataGram<msg1to2>) => void;
}, from: Observable<DataGram<"response_put" | "response_id" | "response_call" | "call_error" | "call_complete" | e>>, channel: [number]) => CallHandler<RH, ECtx, fIds, fdcp, fkx>;
export declare const createProxy: <RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends Record<fIds, [[unknown, import("./types/basic").TVCDA_CIM, 1 | 2], [unknown, import("./types/basic").TVCDA_CIM, 1 | 2], import("./types/basic").Json]>, fkx extends FkxConstraint<fIds, fdcp>>(store1: Store<RH, ECtx, never, {}, {}, fIds, fdcp, fkx>, store2: Store<RH, ECtx, fIds, fdcp, fkx, never, {}, {}>, msg1to2: Subject<DataGram<"complete" | "error" | "unsubscribe" | "put" | "call" | "end_call" | "response_put" | "response_id" | "response_call" | "call_error" | "call_complete">>, msg2to1: Subject<DataGram<"complete" | "error" | "unsubscribe" | "put" | "call" | "end_call" | "response_put" | "response_id" | "response_call" | "call_error" | "call_complete">>) => {
    channel: [0];
    callHandler: CallHandler<RH, ECtx, fIds, fdcp, fkx>;
    subscription: Subscription;
};

import { Store } from "./store";
import { Subject, Subscription } from "rxjs";
import { RHConstraint, CallHandler } from "./types";
export declare type DataGram<T extends string> = {
    channel: number;
    type: T;
    data: string;
};
export declare type msg1to2 = 'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call';
export declare type msg2to1 = 'response_put' | 'response_call' | 'call_error' | 'call_complete';
export declare const startListener: <RH extends RHConstraint<RH, ECtx>, ECtx>(store: Store<RH, ECtx>, from: Subject<DataGram<msg1to2>>, to: Subject<DataGram<msg2to1>>) => Subscription;
export declare const createCallHandler: <RH extends RHConstraint<RH, ECtx>, ECtx>(to: Subject<DataGram<msg1to2>>, from: Subject<DataGram<msg2to1>>, channel: [number]) => CallHandler<any, any, any, any, any, any, any, any, any, any, any, RH, ECtx>;

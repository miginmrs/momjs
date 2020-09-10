import { Store } from "./store";
import { Subject, Subscription } from "rxjs";
import { RHConstraint, CallHandler } from "./types";
export declare type DataGram<T extends string> = {
    channel: number;
    type: T;
    data: string;
};
export declare const startListener: <RH extends RHConstraint<RH, ECtx>, ECtx>(store: Store<RH, ECtx>, from: Subject<DataGram<'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call'>>, to: Subject<DataGram<'response_put' | 'response_call' | 'call_error' | 'call_complete'>>) => Subscription;
export declare const createCallHandler: <RH extends RHConstraint<RH, ECtx>, ECtx>(to: Subject<DataGram<'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call'>>, from: Subject<DataGram<'response_put' | 'response_call' | 'call_error' | 'call_complete'>>, channel: [number]) => CallHandler<any, any, any, any, any, any, any, any, any, any, any, RH, ECtx>;

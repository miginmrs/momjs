import type { AppX } from 'dependent-type';
import type { Subscription, Observable, OperatorFunction } from 'rxjs';
import type { GlobalRef, TVCDADepConstaint, TVCDA_CIM } from '../basic';
import type { TSerialObs } from '../serial';
import type { FdcpConstraint, FIDS, FkxConstraint } from './functions';
import type { EModelsDefinition } from './definition';
import type { ModelsDefinition, RHConstraint } from './handler';
import type { IStore, Notifier } from '../params';
export declare type DCN = [unknown, TVCDA_CIM, 1 | 2];
export declare type KXConstraint<dcn extends DCN> = [TVCDADepConstaint<dcn[0], dcn[1]>, dcn[0]];
export declare type KX = KXConstraint<DCN>;
export declare type CallHandler<dcn extends DCN, kx extends KXConstraint<dcn>, RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends FdcpConstraint<fIds>, fkx extends FkxConstraint<fIds, fdcp>> = {
    watch: () => {
        unsubscribe: (ref: GlobalRef<AppX<'V', dcn[1], kx[0], kx[1]>>) => void;
        complete: (ref: GlobalRef<AppX<'V', dcn[1], kx[0], kx[1]>>) => void;
        put: (def: EModelsDefinition<0, [[dcn[0], dcn[1]]], [kx[0]], [kx[1]], [dcn[2]], RH, ECtx>) => PromiseLike<{
            0: GlobalRef<AppX<'V', dcn[1], kx[0], kx[1]>>;
        } & GlobalRef<any>[]>;
        error: (ref: GlobalRef<AppX<'V', dcn[1], kx[0], kx[1]>>, err: any) => void;
        shutdown: (operator: OperatorFunction<unknown, unknown>, notifier: Notifier) => void;
    };
    call: <fId extends fIds>() => {
        end_call: () => void;
        call: (fId: fId, param: fdcp[fId][2], ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>, opt: {
            ignore?: string[];
            global?: boolean;
        }) => void;
        subscribeToResult: (cbs: {
            resp_id: (ref: GlobalRef<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>) => void;
            resp_call: (data: ModelsDefinition<0, [[fdcp[fId][1][0], fdcp[fId][1][1]]], [fkx[fId][2]], [fkx[fId][3]], [fdcp[fId][1][2]], RH, ECtx>) => void;
            err_call: (err: any) => PromiseLike<void>;
            comp_call: () => PromiseLike<void>;
        }) => Subscription;
    };
    serialized: WeakMap<TSerialObs<any, RH, ECtx>, Observable<GlobalRef<any>>>;
};
export declare type Listener<RH extends RHConstraint<RH, ECtx>, ECtx, lfIds extends FIDS, lfdcp extends FdcpConstraint<lfIds>, lfkx extends FkxConstraint<lfIds, lfdcp>> = (store: IStore<RH, ECtx, lfIds, lfdcp, lfkx>) => Subscription;

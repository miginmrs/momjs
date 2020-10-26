import type { AppX } from 'dependent-type';
import type { Subscription, Observable } from 'rxjs';
import type { GlobalRef } from '../basic';
import type { TSerialObs } from '../serial';
import type { FdcpConstraint, FIDS, FkxConstraint } from './functions';
import type { EModelsDefinition } from './definition';
import type { ModelsDefinition, RHConstraint } from './handler';

export type CallHandler<
  RH extends RHConstraint<RH, ECtx>,
  ECtx,
  fIds extends FIDS,
  fdcp extends FdcpConstraint<fIds>,
  fkx extends FkxConstraint<fIds, fdcp>,
  > = {
    handlers: <fId extends fIds>() => {
      end_call: () => void,
      unsubscribe: (ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>) => void,
      complete: (ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>) => void,
      put: (def: EModelsDefinition<0, [[fdcp[fId][0][0], fdcp[fId][0][1]]], [fkx[fId][0]], [fkx[fId][1]], [fdcp[fId][0][2]], RH, ECtx>) => PromiseLike<{ 0: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>; } & GlobalRef<any>[]>,
      call: (fId: fId, param: fdcp[fId][2], ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>, opt: { ignore?: string[], global?: boolean }) => void,
      error: (ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>, err: any) => void,
      subscribeToResult: (cbs: {
        resp_id: (ref: GlobalRef<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>) => void;
        resp_call: (data: ModelsDefinition<0, [[fdcp[fId][1][0], fdcp[fId][1][1]]], [fkx[fId][2]], [fkx[fId][3]], [fdcp[fId][1][2]], RH, ECtx>) => void;
        err_call: (err: any) => PromiseLike<void>;
        comp_call: () => PromiseLike<void>;
      }) => Subscription,
    },
    serialized: WeakMap<TSerialObs<any, RH, ECtx>, Observable<GlobalRef<any>>>
  };

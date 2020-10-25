import { AppX } from 'dependent-type';
import { Subscription } from 'rxjs';
import { Origin } from '../../origin';
import { EHConstraint, TSerialObs } from '../serial';
import { Json, TVCDADepConstaint, TVCDA_CIM } from '../basic';

export type FIDS = number | string;
export type FdcpConstraint<fIds extends FIDS> = Record<fIds, [[unknown, TVCDA_CIM, 1 | 2], [unknown, TVCDA_CIM, 1 | 2], Json]>;
export type FkxConstraint<fIds extends FIDS, fdcp extends FdcpConstraint<fIds>> = {
  [P in fIds]: [TVCDADepConstaint<fdcp[P][0][0], fdcp[P][0][1]>, fdcp[P][0][0], TVCDADepConstaint<fdcp[P][1][0], fdcp[P][1][1]>, fdcp[P][1][0]];
};
export type Functions<
  EH extends EHConstraint<EH, ECtx>,
  ECtx,
  fIds extends FIDS,
  fdcp extends FdcpConstraint<fIds>,
  fkx extends FkxConstraint<fIds, fdcp>,
  > = {
    [fId in fIds]: (param: fdcp[fId][2], arg: TSerialObs<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>, EH, ECtx> & {
      origin: Origin<fdcp[fId][0][0], fdcp[fId][0][1], fkx[fId][0], fkx[fId][1], fdcp[fId][0][2], EH, ECtx>
    }, subs: Subscription) => PromiseLike<TSerialObs<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>, EH, ECtx> & {
      origin: Origin<fdcp[fId][1][0], fdcp[fId][1][1], fkx[fId][2], fkx[fId][3], fdcp[fId][1][2], EH, ECtx>
    }>
  };


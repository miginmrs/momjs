import { KeysOfType, AppX } from 'dependent-type';
import { CtxEH, EHConstraint } from '../serial';
import {ModelData, TVCDADepConstaint, TVCDA_CIM} from '../basic';

export type EModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  type: KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>> & string, c: AppX<'C', cim, k, X>,
} & ModelData<AppX<'T', cim, k, X>>;

export type AnyEModelDefinition<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  type: keyof EH & string, c: any
} & ModelData<any>;
export type AnyModelDefinition<EH extends EHConstraint<EH, ECtx>, ECtx, indices extends number = number> = (AnyEModelDefinition<EH, ECtx> & { i: indices });


export type EModelsDefinition<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = {
    [P in indices]: EModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], N[P], EH, ECtx> & { i: P }
  } & (AnyModelDefinition<EH, ECtx, indices>)[];

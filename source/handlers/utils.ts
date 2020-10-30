import { keytype } from 'dependent-type';
import { TVCDA_CIM, TVCDADepConstaint, } from '../types/basic';
import { EHConstraint, SerialCtrs, SerialCtr, RequestHandleEncode, RequestHandleEncodes } from '../types/serial';
import { RequestHandleDecode, RequestHandleDecodes } from '../types/store';

export const getCtr = <dom extends keytype, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx>(
  ctrs: SerialCtrs<dom, cim, k, n, EH, ECtx>, i: dom
) => ctrs[i] as SerialCtr<dom, cim, k, n, EH, ECtx>;


export const getEncode = <dom extends keytype, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx>(
  ctrs: RequestHandleEncodes<dom, cim, k, n, EH, ECtx>, i: dom
) => ctrs[i] as RequestHandleEncode<dom, cim, k, n, EH, ECtx>;

export const getDecode = <dom extends keytype, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx>(
  ctrs: RequestHandleDecodes<dom, cim, k, n, EH, ECtx>, i: dom
) => ctrs[i] as RequestHandleDecode<dom, cim, k, n, EH, ECtx>;


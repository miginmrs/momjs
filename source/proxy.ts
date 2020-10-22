import { Store } from "./store";
import { Observable, Subject, Subscription } from "rxjs";
import { filter, take } from "rxjs/operators";
import { GlobalRef, RHConstraint, CallHandler, FdcpConstraint, FkxConstraint, FIDS } from "./types";
import { QuickPromise } from "../utils/quick-promise";
import { AppX } from ".";

export type DataGram<T extends string> = { channel: number, type: T, data: string };

export type msg1to2 = 'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call';
export type msg2to1 = 'response_put' | 'response_id' | 'response_call' | 'call_error' | 'call_complete';
export const msg1to2keys: Record<msg1to2, 0> = { call: 0, complete: 0, error: 0, end_call: 0, put: 0, unsubscribe: 0 };
export const msg2to1keys: Record<msg2to1, 0> = { call_complete: 0, call_error: 0, response_call: 0, response_id: 0, response_put: 0 };
export const startListener = <RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends FdcpConstraint<fIds>, fkx extends FkxConstraint<fIds, fdcp>, e extends string = never>(
  store: Store<RH, ECtx, fIds, fdcp, fkx>,
  from: Observable<DataGram<msg1to2 | e>>,
  to: { next: (x: DataGram<msg2to1>) => void },
) => from.subscribe(function (this: Subscription, { channel, type, data }) {
  type fId = fIds;
  type V = AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>;
  switch (type) {
    case 'put': {
      const refs = store.unserialize<0, [[fdcp[fId][0][0], fdcp[fId][0][1]]], [fkx[fId][0]], [fkx[fId][1]], [fdcp[fId][0][2]]>(JSON.parse(data))!
      return to.next({ channel, type: 'response_put', data: JSON.stringify(refs) });
    }
    case 'unsubscribe':
      const ref = { id: JSON.parse(data) } as GlobalRef<V>;
      return store.getValue(ref)[1].subscription?.unsubscribe()
    case 'error': {
      const { id, msg } = JSON.parse(data);
      const ref = { id } as GlobalRef<V>;
      const obs = store.getValue(ref)[0];
      if (!obs) return;
      return (obs as typeof obs.origin).subject.error(msg);
    }
    case 'complete': {
      const ref = { id: JSON.parse(data) } as GlobalRef<V>;
      const obs = store.getValue(ref)[0];
      if (!obs) return;
      return (obs as typeof obs.origin).subject.complete();
    }
    case 'call': {
      const json = JSON.parse(data); json.ref = { id: json.argId };
      const { fId, ref, opt, param }: {
        fId: fId, param: fdcp[fId][2], ref: GlobalRef<V>,
        opt: { ignore?: string[], graph?: boolean }
      } = json;
      const endCallSubs = from.pipe(filter(x => x.channel === channel && x.type === 'end_call')).subscribe(() => {
        subs.unsubscribe();
      });
      const observer = {
        error: (err: any) => to.next({ channel, type: 'call_error', data: JSON.stringify(err) }),
        complete: () => to.next({ channel, type: 'call_complete', data: '' }),
      };
      const subs = opt.graph ? store.call(fId, param, ref, { ...opt, graph: true }).subscribe({
        ...observer, next: def => {
          to.next({ channel, type: 'response_call', data: JSON.stringify(def) });
        }
      }) : store.call(fId, param, ref, { ...opt, graph: false }).subscribe({
        ...observer, next: ref => {
          to.next({ channel, type: 'response_id', data: JSON.stringify(ref.id) });
        }
      });
      subs.add(endCallSubs);
      this.add(subs);
      return;
    }
  };
});


export const createCallHandler = <RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends FdcpConstraint<fIds>, fkx extends FkxConstraint<fIds, fdcp>, e extends string = never>(
  to: { next: (x: DataGram<msg1to2>) => void },
  from: Observable<DataGram<msg2to1 | e>>,
  channel: [number]
): CallHandler<RH, ECtx, fIds, fdcp, fkx> => {
  return {
    serialized: new WeakMap(),
    handlers: <fId extends fIds>() => {
      const callChannel = channel[0]++;
      return {
        end_call: () => to.next({ channel: callChannel, type: 'end_call', data: '' }),
        unsubscribe: ref => to.next({ channel: callChannel, data: JSON.stringify(ref.id), type: 'unsubscribe' }),
        put: (def) => {
          const ch = channel[0]++;
          const promise = from.pipe(filter(m => m.channel === ch && m.type === 'response_put'), take(1)).toPromise(QuickPromise).then(response => {
            return JSON.parse(response.data);
          });
          to.next({ channel: ch, type: 'put', data: JSON.stringify(def) })
          return promise;
        },
        error: (ref, e) => to.next({ channel: callChannel, data: JSON.stringify({ id: ref.id, msg: `${e}` }), type: 'error' }),
        complete: ref => to.next({ channel: callChannel, data: JSON.stringify(ref.id), type: 'complete' }),
        call: (fId, param, ref, opt) => to.next({ channel: callChannel, data: JSON.stringify({ fId, param, argId: ref.id, opt }), type: 'call' }),
        subscribeToResult: cbs => from.pipe(filter(x => x.channel === callChannel && x.type in msg2to1keys)).subscribe(
          function (this: Subscription, { data, type }) {
            if (type === 'response_id') {
              cbs.resp_id({ id: JSON.parse(data) } as GlobalRef<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>);
            }
            if (type === 'response_call') {
              cbs.resp_call(JSON.parse(data));
            }
            if (type === 'call_error') {
              cbs.err_call(data).then(() => this.unsubscribe());
              this.unsubscribe();
            }
            if (type === 'call_complete') {
              cbs.comp_call().then(() => this.unsubscribe());
            }
          }
        )
      }
    }
  }
}


export const createProxy = <RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends FdcpConstraint<fIds>, fkx extends FkxConstraint<fIds, fdcp>>(
  store1: Store<RH, ECtx, fIds, fdcp, fkx>,
  store2: Store<RH, ECtx, fIds, fdcp, fkx>,
  msg1to2: Subject<DataGram<msg1to2 | msg2to1>>,
  msg2to1: Subject<DataGram<msg1to2 | msg2to1>>,
) => {
  const subscription = new Subscription()
  const channel = [0] as [0];
  const callHandler = createCallHandler<RH, ECtx, fIds, fdcp, fkx, msg1to2>(msg1to2, msg2to1, channel);
  subscription.add(startListener(store2, msg1to2, msg2to1));
  subscription.add(store1.watch(callHandler));
  return { channel, callHandler, subscription };
};


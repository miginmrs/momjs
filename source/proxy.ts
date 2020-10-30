import { Store } from './store';
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { filter, mapTo, take } from 'rxjs/operators';
import { QuickPromise } from '../utils/quick-promise';
import type { GlobalRef } from './types/basic';
import type { CallHandler, RHConstraint, FdcpConstraint, FkxConstraint, FIDS, KXConstraint, DCN, KX } from './types/store';
import type { AppX } from 'dependent-type';
import { IStore, Notifier } from './types/params';

export type DataGram<T extends string> = { channel: number, type: T, data: string };

export type msg1to2 = 'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call' | 'shutdown';
export type msg2to1 = 'response_put' | 'response_id' | 'response_call' | 'call_error' | 'call_complete' | 'shutdown_ack';
export const msg1to2keys: Record<msg1to2, 0> = { call: 0, complete: 0, error: 0, end_call: 0, put: 0, unsubscribe: 0, shutdown: 0, };
export const msg2to1keys: Record<msg2to1, 0> = { call_complete: 0, call_error: 0, response_call: 0, response_id: 0, response_put: 0, shutdown_ack: 0, };
export const startListener = <e extends string = never>(
  from: Observable<DataGram<msg1to2 | e>>,
  to: { next: (x: DataGram<msg2to1>) => void },
) => <dcn extends DCN, kx extends KXConstraint<dcn>, RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends FdcpConstraint<fIds>, fkx extends FkxConstraint<fIds, fdcp>>(
  store: IStore<RH, ECtx, fIds, fdcp, fkx>
) => from.subscribe(function (this: Subscription, { channel, type, data }) {
  type fId = fIds;
  type V = AppX<'V', dcn[1], kx[0], kx[1]>;
  switch (type) {
    case 'put': {
      const refs = store.unserialize<0, [[dcn[0], dcn[1]]], [kx[0]], [kx[1]], [dcn[2]]>(JSON.parse(data))!;
      return to.next({ channel, type: 'response_put', data: JSON.stringify(refs) });
    }
    case 'shutdown': {
      return store.shutdown(unlink => {
        to.next({ channel, type: 'shutdown_ack', data: '' });
        unlink();
      });
    }
    case 'unsubscribe': {
      const ref = { id: JSON.parse(data) } as GlobalRef<V>;
      return store.getValue(ref)[1].subscription?.unsubscribe();
    }
    case 'error': {
      const { id, msg } = JSON.parse(data);
      const ref = { id } as GlobalRef<V>;
      const obs = store.getValue(ref)[0];
      if (!obs) return;
      return obs.origin.subject.error(msg);
    }
    case 'complete': {
      const ref = { id: JSON.parse(data) } as GlobalRef<V>;
      const obs = store.getValue(ref)[0];
      if (!obs) return;
      return obs.origin.subject.complete();
    }
    case 'call': {
      const json = JSON.parse(data); json.ref = { id: json.argId };
      const { fId, ref, opt, param }: {
        fId: fId, param: fdcp[fId][2], ref: GlobalRef<V>,
        opt: { ignore?: string[], graph?: boolean }
      } = json;
      const endCallSubs = from.pipe(filter(x => x.channel === channel && x.type === 'end_call')).subscribe(() => subs.unsubscribe());
      const observer = {
        error: (err: any) => to.next({ channel, type: 'call_error', data: JSON.stringify(err) }),
        complete: () => to.next({ channel, type: 'call_complete', data: '' }),
      };
      const subs = opt.graph ? store.call(fId, param, ref, { ...opt, graph: true }).subscribe({
        ...observer, next: def => to.next({ channel, type: 'response_call', data: JSON.stringify(def) })
      }) : store.call(fId, param, ref, { ...opt, graph: false }).subscribe({
        ...observer, next: ref => to.next({ channel, type: 'response_id', data: JSON.stringify(ref.id) })
      });
      subs.add(endCallSubs);
      this.add(subs);
      return;
    }
  };
});


export const createCallHandler = <dcn extends DCN, kx extends KXConstraint<dcn>, RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends FdcpConstraint<fIds>, fkx extends FkxConstraint<fIds, fdcp>, e extends string = never>(
  to: { next: (x: DataGram<msg1to2>) => void },
  from: Observable<DataGram<msg2to1 | e>>,
  channel: [number]
): CallHandler<dcn, kx, RH, ECtx, fIds, fdcp, fkx> => {
  return {
    serialized: new WeakMap(),
    watch: () => {
      const common = channel[0]++;
      return {
        unsubscribe: ref => to.next({ channel: common, data: JSON.stringify(ref.id), type: 'unsubscribe' }),
        put: (def) => {
          const ch = channel[0]++;
          const promise = from.pipe(filter(m => m.channel === ch && m.type === 'response_put'), take(1)).toPromise(QuickPromise).then(response => {
            return JSON.parse(response.data);
          });
          to.next({ channel: ch, type: 'put', data: JSON.stringify(def) });
          return promise;
        },
        error: (ref, e) => to.next({ channel: common, type: 'error', data: JSON.stringify({ id: ref.id, msg: `${e}` }) }),
        complete: ref => to.next({ channel: common, type: 'complete', data: JSON.stringify(ref.id) }),
        shutdown: (operator, notifier) => {
          from.pipe(filter(x => x.channel === common && x.type === 'shutdown_ack'), take(1), operator, mapTo(notifier)).subscribe(notifier);
          to.next({ type: 'shutdown', data: '', channel: common });
        },
      }
    },
    call: <fId extends fIds>() => {
      const callChannel = channel[0]++;
      return {
        call: (fId, param, ref, opt) => to.next({ channel: callChannel, type: 'call', data: JSON.stringify({ fId, param, argId: ref.id, opt }) }),
        end_call: () => to.next({ channel: callChannel, type: 'end_call', data: '' }),
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
  store1: Store<RH, ECtx, never, {}, {}, fIds, fdcp, fkx>,
  store2: Store<RH, ECtx, fIds, fdcp, fkx, never, {}, {}>,
  msg1to2: Subject<DataGram<msg1to2 | msg2to1>>,
  msg2to1: Subject<DataGram<msg1to2 | msg2to1>>,
) => {
  const subscription = new Subscription()
  const channel = [0] as [0];
  const callHandler = createCallHandler<DCN, KX, RH, ECtx, fIds, fdcp, fkx, msg1to2>(msg1to2, msg2to1, channel);
  subscription.add(startListener(msg1to2, msg2to1)(store2));
  subscription.add(store1.watch(callHandler));
  return { channel, callHandler, subscription };
};


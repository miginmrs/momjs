import { Store } from "./store";
import { Subject, Subscription } from "rxjs";
import { filter, take } from "rxjs/operators";
import { GlobalRef, RHConstraint, CallHandler } from "./types";
import { QuickPromise } from "../utils/quick-promise";

export type DataGram<T extends string> = { channel: number, type: T, data: string };

export const startListener = <RH extends RHConstraint<RH, ECtx>, ECtx>(
  store: Store<RH, ECtx>,
  from: Subject<DataGram<'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call'>>,
  to: Subject<DataGram<'response_put' | 'response_call' | 'call_error' | 'call_complete'>>,
) => from.subscribe(function (this: Subscription, { channel, type, data }) {
  if (type === 'put') {
    const refs = store.unserialize(JSON.parse(data))!
    to.next({ channel, type: 'response_put', data: JSON.stringify(refs) });
  };
  if (type === 'unsubscribe') {
    store.get(data)?.[1].subscription?.unsubscribe()
  };
  if (type === 'error') {
    const { id, msg } = JSON.parse(data);
    const obs = store.get(id)?.[0];
    if (!obs) return;
    (obs as typeof obs.origin)?.subject.error(msg);
  };
  if (type === 'complete') {
    const obs = store.get(data)?.[0];
    if (!obs) return;
    (obs as typeof obs.origin).subject.complete();
  }
  if (type === 'call') {
    const { fId, param, argId } = JSON.parse(data);
    const endCallSubs = from.pipe(filter(x => x.channel === channel && x.type === 'end_call')).subscribe(() => {
      subs.unsubscribe();
    });
    const subs = store.call(fId, param, { id: argId } as GlobalRef<any>).subscribe(def => {
      to.next({ channel, type: 'response_call', data: JSON.stringify(def) });
    }, err => {
      to.next({ channel, type: 'call_error', data: `${err}` });
    }, () => {
      to.next({ channel, type: 'call_complete', data: '' });
    });
    subs.add(endCallSubs);
    this.add(subs);
  }
});


export const createCallHandler = <RH extends RHConstraint<RH, ECtx>, ECtx>(
  to: Subject<DataGram<'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call'>>,
  from: Subject<DataGram<'response_put' | 'response_call' | 'call_error' | 'call_complete'>>,
  channel: [number]
): CallHandler<any, any, any, any, any, any, any, any, any, any, any, RH, ECtx> => {
  return {
    serialized: new WeakMap(),
    handlers: () => {
      const putChannel = channel[0]++, callChannel = channel[0]++;
      return {
        end_call: () => to.next({ channel: callChannel, type: 'end_call', data: '' }),
        call_unsubscribe: ref => to.next({ channel: putChannel, data: ref.id, type: 'unsubscribe' }),
        call_complete: ref => to.next({ channel: putChannel, data: ref.id, type: 'complete' }),
        put: (def) => to.next({ channel: putChannel, type: 'put', data: JSON.stringify(def) }),
        call: (fId, param, ref) => to.next({ channel: callChannel, data: JSON.stringify({ fId, param, argId: ref.id }), type: 'call' }),
        error: (ref, e) => to.next({ channel: putChannel, data: JSON.stringify({ id: ref.id, msg: `${e}` }), type: 'error' }),
        next: () => from.pipe(filter(m => m.channel === putChannel), take(1)).toPromise(QuickPromise).then(response => {
          return JSON.parse(response.data);
        }),
        subscribeToResult: cbs => from.pipe(filter(x => x.channel === callChannel)).subscribe(
          function (this: Subscription, { data, type }) {
            if (type === 'response_call') {
              cbs.resp_call(JSON.parse(data));
            }
            if (type === 'call_error') {
              cbs.err_call(data);
              this.unsubscribe();
            }
            if (type === 'call_complete') {
              cbs.comp_call();
              this.unsubscribe();
            }
          }
        )
      }
    }
  }
}
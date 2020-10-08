import { Subscription } from "rxjs";
import { filter, take } from "rxjs/operators";
import { QuickPromise } from "../utils/quick-promise";
export const msg1to2keys = { call: 0, complete: 0, error: 0, end_call: 0, put: 0, unsubscribe: 0 };
export const msg2to1keys = { call_complete: 0, call_error: 0, response_call: 0, response_id: 0, response_put: 0 };
export const startListener = (store, from, to) => from.subscribe(function ({ channel, type, data }) {
    switch (type) {
        case 'put': {
            const refs = store.unserialize(JSON.parse(data));
            return to.next({ channel, type: 'response_put', data: JSON.stringify(refs) });
        }
        case 'unsubscribe':
            const ref = { id: JSON.parse(data) };
            return store.getValue(ref)[1].subscription?.unsubscribe();
        case 'error': {
            const { id, msg } = JSON.parse(data);
            const ref = { id };
            const obs = store.getValue(ref)[0];
            if (!obs)
                return;
            return obs.subject.error(msg);
        }
        case 'complete': {
            const ref = { id: JSON.parse(data) };
            const obs = store.getValue(ref)[0];
            if (!obs)
                return;
            return obs.subject.complete();
        }
        case 'call': {
            const json = JSON.parse(data);
            json.ref = { id: json.argId };
            const { fId, ref, opt, param } = json;
            const endCallSubs = from.pipe(filter(x => x.channel === channel && x.type === 'end_call')).subscribe(() => {
                subs.unsubscribe();
            });
            const observer = {
                error: (err) => to.next({ channel, type: 'call_error', data: JSON.stringify(err) }),
                complete: () => to.next({ channel, type: 'call_complete', data: '' }),
            };
            const subs = opt.graph ? store.local(fId, param, ref, { ...opt, graph: true }).subscribe({
                ...observer, next: def => {
                    to.next({ channel, type: 'response_call', data: JSON.stringify(def) });
                }
            }) : store.local(fId, param, ref, { ...opt, graph: false }).subscribe({
                ...observer, next: ref => {
                    to.next({ channel, type: 'response_id', data: JSON.stringify(ref.id) });
                }
            });
            subs.add(endCallSubs);
            this.add(subs);
            return;
        }
    }
    ;
});
export const createCallHandler = (to, from, channel) => {
    return {
        serialized: new WeakMap(),
        handlers: () => {
            const callChannel = channel[0]++;
            return {
                end_call: () => to.next({ channel: callChannel, type: 'end_call', data: '' }),
                unsubscribe: ref => to.next({ channel: callChannel, data: JSON.stringify(ref.id), type: 'unsubscribe' }),
                put: (def) => {
                    const ch = channel[0]++;
                    const promise = from.pipe(filter(m => m.channel === ch && m.type === 'response_put'), take(1)).toPromise(QuickPromise).then(response => {
                        return JSON.parse(response.data);
                    });
                    to.next({ channel: ch, type: 'put', data: JSON.stringify(def) });
                    return promise;
                },
                error: (ref, e) => to.next({ channel: callChannel, data: JSON.stringify({ id: ref.id, msg: `${e}` }), type: 'error' }),
                complete: ref => to.next({ channel: callChannel, data: JSON.stringify(ref.id), type: 'complete' }),
                call: (fId, param, ref, opt) => to.next({ channel: callChannel, data: JSON.stringify({ fId, param, argId: ref.id, opt }), type: 'call' }),
                subscribeToResult: cbs => from.pipe(filter(x => x.channel === callChannel && x.type in msg2to1keys)).subscribe(function ({ data, type }) {
                    if (type === 'response_id') {
                        cbs.resp_id({ id: JSON.parse(data) });
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
                })
            };
        }
    };
};
export const createProxy = (store1, store2, msg1to2, msg2to1) => {
    const subscription = new Subscription();
    const channel = [0];
    const callHandler = createCallHandler(msg1to2, msg2to1, channel);
    subscription.add(startListener(store2, msg1to2, msg2to1));
    subscription.add(store1.watch(callHandler));
    return { channel, callHandler, subscription };
};
//# sourceMappingURL=proxy.js.map
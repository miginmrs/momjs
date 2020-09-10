"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCallHandler = exports.startListener = void 0;
const operators_1 = require("rxjs/operators");
const quick_promise_1 = require("../utils/quick-promise");
exports.startListener = (store, from, to) => from.subscribe(function ({ channel, type, data }) {
    switch (type) {
        case 'put': {
            const refs = store.unserialize(JSON.parse(data));
            return to.next({ channel, type: 'response_put', data: JSON.stringify(refs) });
        }
        case 'unsubscribe':
            return store.get(data)?.[1].subscription?.unsubscribe();
        case 'error': {
            const { id, msg } = JSON.parse(data);
            const obs = store.get(id)?.[0];
            if (!obs)
                return;
            return obs.subject.error(msg);
        }
        case 'complete': {
            const obs = store.get(data)?.[0];
            if (!obs)
                return;
            return obs.subject.complete();
        }
        case 'call': {
            const { fId, param, argId } = JSON.parse(data);
            store.local(fId, param, { id: argId }).then(obs => {
                const endCallSubs = from.pipe(operators_1.filter(x => x.channel === channel && x.type === 'end_call')).subscribe(() => {
                    subs.unsubscribe();
                });
                const subs = obs.subscribe(def => {
                    to.next({ channel, type: 'response_call', data: JSON.stringify(def) });
                }, err => {
                    to.next({ channel, type: 'call_error', data: `${err}` });
                }, () => {
                    to.next({ channel, type: 'call_complete', data: '' });
                });
                subs.add(endCallSubs);
                this.add(subs);
            });
            return;
        }
    }
    ;
});
exports.createCallHandler = (to, from, channel) => {
    return {
        serialized: new WeakMap(),
        handlers: () => {
            const putChannel = channel[0]++, callChannel = channel[0]++;
            return {
                end_call: () => to.next({ channel: callChannel, type: 'end_call', data: '' }),
                call_unsubscribe: ref => to.next({ channel: putChannel, data: ref.id, type: 'unsubscribe' }),
                complete: ref => to.next({ channel: putChannel, data: ref.id, type: 'complete' }),
                put: (def) => to.next({ channel: putChannel, type: 'put', data: JSON.stringify(def) }),
                call: (fId, param, ref) => to.next({ channel: callChannel, data: JSON.stringify({ fId, param, argId: ref.id }), type: 'call' }),
                error: (ref, e) => to.next({ channel: putChannel, data: JSON.stringify({ id: ref.id, msg: `${e}` }), type: 'error' }),
                next: () => from.pipe(operators_1.filter(m => m.channel === putChannel), operators_1.take(1)).toPromise(quick_promise_1.QuickPromise).then(response => {
                    return JSON.parse(response.data);
                }),
                subscribeToResult: cbs => from.pipe(operators_1.filter(x => x.channel === callChannel)).subscribe(function ({ data, type }) {
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
//# sourceMappingURL=proxy.js.map
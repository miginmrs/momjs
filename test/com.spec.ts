import { expect } from 'chai';
import { Store } from '../source/store';
import { ArrayCim, ArrayHandler, ArrayTypeKeys, JsonCim, JsonHandler, JsonTypeKeys } from '../source/handlers';
import { wrapJson, wrapArray, JsonObject, PromiseCtr, Json, CtxH } from '../source';
import { Subscription, Subject } from 'rxjs';
import { take, toArray, map, finalize } from 'rxjs/operators';
import { current } from '../utils/rx-utils';
import { startListener, DataGram, createCallHandler, msg1to2, msg2to1 } from '../source/proxy'
import { QuickPromise } from '../utils/quick-promise';
import _ from 'lodash';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';
import { msg, MsgGenerator, parallel, start } from './common';
import { checkMsgs } from './com.list';

namespace RequestHandlers {
  export const Array: CtxH<any[], ArrayCim, ArrayTypeKeys, 1, RH, {}> = ArrayHandler<RH, {}>();
  export const Json: CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, RH, {}> = JsonHandler<RH, {}>();
}
type RH = typeof RequestHandlers;


describe('Stores Communication', () => {
  type xn = { x: number };
  type Values = { firstCall: xn[], secondCall: xn[], allMsgs: msg[], remainingKeys: string[] };
  const senario = (done: (values: Values) => void, Promise: PromiseCtr) => {
    const handlers = RequestHandlers;

    // COMMON
    const fId = 0;
    const store1_to_store2 = new Subject<DataGram<msg1to2>>();
    const store2_to_store1 = new Subject<DataGram<msg2to1>>();
    const channel = [0] as [0];
    const msgs: msg[] = [];
    const callHandler = createCallHandler<RH, {}>(store1_to_store2, store2_to_store1, channel);

    const channelSubs = store1_to_store2.subscribe(v => {
      // console.log('1->2', v.channel, v.type, v.data);
      msgs.push(['1->2', v.channel, v.type, v.data && JSON.parse(v.data)]);
    });
    channelSubs.add(store2_to_store1.subscribe(v => {
      // console.log('2->1', v.channel, v.type, v.data);
      msgs.push(['2->1', v.channel, v.type, v.data && JSON.parse(v.data)]);
    }));

    // STORE2

    const store2 = new Store(handlers, {}, Promise, 'store2');
    store2.functions[fId] = (_, arg) => {
      const [{ x: a }, { x: b }]: [xn, xn] = current(arg);
      const subs = new Subscription();
      const obs = wrapJson<xn, RH, {}>({ x: a * b }, handlers, subs);
      subs.add(arg.subscribe(
        v => {
          arg;
          const [{ x: a }, { x: b }] = v;
          obs.subject.next({ args: [], data: { x: a * b }, n: 1 })
        },
        e => obs.subject.error(e),
        () => obs.subject.complete()
      ));
      return obs;
    };
    startListener(store2, store1_to_store2, store2_to_store1);

    const store1 = new Store(handlers, {}, Promise, 'store1', '$');
    const a = wrapJson<xn, RH, {}>({ x: 5 }, handlers);
    const b = wrapJson<xn, RH, {}>({ x: 10 }, handlers);
    const c = wrapJson<xn, RH, {}>({ x: 20 }, handlers);
    const arg = wrapArray<[xn, xn], RH, {}>([a, b], handlers);
    const subs = arg.subscribe();
    let firstCallResult: xn[] = [];

    store1.remote<JsonObject, JsonCim, JsonTypeKeys, xn, 1>()(
      fId, arg, null, callHandler
    ).pipe(take(2), map(v => ({ ...v })), toArray()).subscribe(
      v => firstCallResult = v
    );

    const receivedValues: xn[] = [];
    // STORE1
    const ret = store1.remote<JsonObject, JsonCim, JsonTypeKeys, xn, 1>()(
      fId, arg, null, callHandler
    );
    ret.pipe(finalize(
      () => channelSubs.unsubscribe()
    )).subscribe(async function (this: SafeSubscriber<xn>, v) {
      receivedValues.push({ ...v });
      if (v.x !== 50) return;
      subs.unsubscribe();
      await new Promise(r => setTimeout(r, 1));
      a.subject.next({ data: { x: 4 }, args: [], n: 1 });
      await new Promise(r => setTimeout(r, 1));
      a.subject.next({ data: { x: 3 }, args: [], n: 1 });
      await new Promise(r => setTimeout(r, 1));
      arg.subject.next({ data: null, n: 1, args: [c, b] })
      await new Promise(r => setTimeout(r, 1));
      c.subject.next({ data: { x: 30 }, args: [], n: 1 });
      await new Promise(r => setTimeout(r, 1));
      b.subject.complete();
    }, () => { }, () => {
      const firstCall = firstCallResult.slice(0);
      const secondCall = receivedValues.slice(0);
      const allMsgs = msgs.slice(0);
      setTimeout(() => done({
        firstCall, secondCall, allMsgs, remainingKeys: [...store1['map'].keys()]
      }), 0);
    });
  };
  _.entries({ QuickPromise, Promise }).forEach(([name, Promise]) => {
    describe(`With ${name}`, () => {
      const p = new QuickPromise<Values>(res => senario(res, Promise));
      it('should communicate unsubscription', async () => {
        const { firstCall } = await p;
        expect(firstCall).deep.eq([{ x: 50 }, { x: 40 }]);
      })
      it('should alter the dependencies of the call function argument', async () => {
        const { secondCall } = await p;
        expect(secondCall).deep.eq([{ x: 50 }, { x: 40 }, { x: 30 }, { x: 200 }, { x: 300 }]);
      })
      it('should respect the communication protocol', async () => {
        const { allMsgs } = await p;
        checkMsgs(allMsgs);
      })
      it('should not keep resources after the call', async () => {
        const { remainingKeys } = await p;
        expect(remainingKeys).deep.eq([]);
      })
    })
  });
});

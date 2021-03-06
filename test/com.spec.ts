import { expect } from 'chai';
import { Store } from '../source/store';
import { array, json, JsonObject, PromiseCtr, CtxH, TVCDAKeys, DCN, KX } from '../source';
import * as src from '../source';
import { Subscription, Subject } from 'rxjs';
import { take, toArray, map, finalize } from 'rxjs/operators';
import { startListener, DataGram, createCallHandler, msg1to2, msg2to1 } from '../source/proxy'
import { QuickPromise } from '../utils/quick-promise';
import _ from 'lodash';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';
import { collect, msg, xn } from './common';
import { checkMsgs } from './com.list';
import { keys } from '../utils/guards';

namespace RequestHandlers {
  export const Array: CtxH<any[], array.cim, array.keys, 1, RH, {}> = src.array.Handler<RH, {}>();
  export const Json: CtxH<JsonObject, json.cim, json.keys, 1, RH, {}> = src.json.Handler<RH, {}>();
}
type RH = typeof RequestHandlers;


describe('Stores Communication', () => {
  type Values = { firstCall: xn[][], secondCall: xn[][], allMsgs: msg[], remainingKeys: string[] };
  const senario = (done: (values: Values) => void, Promise: PromiseCtr) => {
    const getHandler = keys(RequestHandlers);
    const newArray = array.create<RH, {}>(getHandler);
    const newJson = json.create<RH, {}>(getHandler);

    // COMMON
    const fMul = 0; type fMul = typeof fMul;
    type fMuldcp = [[unknown[], array.cim, 1], [unknown[], array.cim, 1], null];
    type StoreFdcp = { [fMul]: fMuldcp };
    type fMulkx = [array.keys, [xn, xn], array.keys, xn[]];
    type StoreFkx = { [fMul]: fMulkx };
    const store1_to_store2 = new Subject<DataGram<msg1to2>>();
    const store2_to_store1 = new Subject<DataGram<msg2to1>>();
    const channel = [0] as [0];
    const msgs: msg[] = [];

    const channelSubs = store1_to_store2.subscribe(v => {
      // console.log('1->2', v.channel, v.type, v.data);
      msgs.push(['1->2', v.channel, v.type, v.data && JSON.parse(v.data)]);
    });
    channelSubs.add(store2_to_store1.subscribe(v => {
      // console.log('2->1', v.channel, v.type, v.data);
      msgs.push(['2->1', v.channel, v.type, v.data && JSON.parse(v.data)]);
    }));

    // STORE2
    const store2 = new Store<RH, {}, fMul, StoreFdcp, StoreFkx, never, {}, {}>({
      getHandler, extra: {}, name: 'store2', promiseCtr: Promise,
      functions: {
        [fMul]: (_, arg) => {
          const subs = new Subscription();
          const obs = newArray<xn[]>([], subs);
          subs.add(arg.subscribe(
            v => {
              arg;
              const [{ x: a }, { x: b }] = v;
              const json = newJson<xn>({ x: a * b });
              obs.subject.next({ args: [...obs.subject.value.args, json], data: null, n: 1 })
            },
            e => obs.subject.error(e),
            () => obs.subject.complete()
          ));
          return Promise.resolve(obs);
        }
      },
      callHandler: null!,
    });
    const callHandler = createCallHandler<DCN, KX, RH, {}, fMul, StoreFdcp, StoreFkx>(store1_to_store2, store2_to_store1, channel);
    startListener(store1_to_store2, store2_to_store1)(store2);

    const store1 = new Store<RH, {}, never, {}, {}, fMul, StoreFdcp, StoreFkx>({
      getHandler, extra: {}, promiseCtr: Promise, functions: {}, name: 'store1', prefix: '$', callHandler,
    });
    const a = newJson<xn>({ x: 5 });
    const b = newJson<xn>({ x: 10 });
    const c = newJson<xn>({ x: 20 });
    const arg = newArray<[xn, xn]>([a, b]);
    const subs = arg.subscribe(() => { });
    let firstCallResult: xn[][] = [];

    store1.remote(fMul, arg, null, { graph: true }).pipe(take(2), map(v => v.slice()), toArray()).subscribe(v => firstCallResult = v);

    const receivedValues: xn[][] = [];
    // STORE1
    const ret = store1.remote(fMul, arg, null, { graph: true });
    ret.pipe(finalize(
      () => channelSubs.unsubscribe()
    )).subscribe(async function (this: SafeSubscriber<xn>, v) {
      receivedValues.push(v.slice());
      // console.log(v);
      if (v.slice(-1)[0].x !== 50) return;
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
        expect(firstCall).deep.eq([{ x: 50 }, { x: 40 }].reduce(collect, []));
      })
      it('should alter the dependencies of the call function argument', async () => {
        const { secondCall } = await p;
        expect(secondCall).deep.eq([{ x: 50 }, { x: 40 }, { x: 30 }, { x: 200 }, { x: 300 }].reduce(collect, []));
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

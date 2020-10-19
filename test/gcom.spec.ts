import { expect } from 'chai';
import { Store } from '../source/store';
import { ArrayCim, ArrayHandler, ArrayTypeKeys, JsonCim, JsonHandler, JsonTypeKeys } from '../source/handlers';
import { wrapJson, wrapArray, JsonObject, PromiseCtr, CtxH } from '../source';
import { Subject, Subscription } from 'rxjs';
import { take, toArray, map } from 'rxjs/operators';
import { createProxy, DataGram, msg1to2, msg2to1 } from '../source/proxy'
import { QuickPromise } from '../utils/quick-promise';
import _ from 'lodash';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';
import { collect, msg, xn } from './common';
import { alternMap } from 'altern-map';

namespace RequestHandlers {
  export const Array: CtxH<any[], ArrayCim, ArrayTypeKeys, 1, RH, {}> = ArrayHandler<RH, {}>();
  export const Json: CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, RH, {}> = JsonHandler<RH, {}>();
}
type RH = typeof RequestHandlers;


describe('Stores Global Communication', () => {
  type Values = { firstCall: xn[][], secondCall: xn[][], allMsgs: msg[], remainingKeys: string[], remainingKeys2: string[] };
  const senario = (done: (values: Values) => void, Promise: PromiseCtr) => {
    const handlers = RequestHandlers;
    const newArray = wrapArray<RH, {}>(handlers);
    const newJson = wrapJson<RH, {}>(handlers);

    // COMMON
    const fMul = 0; type fMul = typeof fMul;
    type fMuldcp = [[unknown[], ArrayCim, 1], [unknown[], ArrayCim, 1], null];
    type StoreFdcp = { [fMul]: fMuldcp };
    type fMulkx = [ArrayTypeKeys, [xn, xn], ArrayTypeKeys, xn[]];
    type StoreFkx = { [fMul]: fMulkx };
    const msgs: msg[] = [];


    // STORE2
    const store2 = new Store<RH, {}, fMul, StoreFdcp, StoreFkx>(handlers, {}, Promise, {
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
    }, 'store2');
    const store1 = new Store<RH, {}, fMul, StoreFdcp, StoreFkx>(handlers, {}, Promise, null, 'store1', '$');
    (global as any).store1 = store1;
    (global as any).store2 = store2;
    const msg1to2 = new Subject<DataGram<msg1to2 | msg2to1>>();
    const msg2to1 = new Subject<DataGram<msg1to2 | msg2to1>>();
    const { subscription: store2Subs, callHandler } = createProxy(store1, store2, msg1to2, msg2to1);
    const { subscription: store1Subs } = createProxy(store2, store1, msg2to1, msg1to2);
    const channelSubs = msg1to2.subscribe(v => {
      // console.log('1->2', v.channel, v.type, v.data);
      // msgs.push(['1->2', v.channel, v.type, v.data && JSON.parse(v.data)]);
    });
    channelSubs.add(msg2to1.subscribe(v => {
      // console.log('2->1', v.channel, v.type, v.data);
      // msgs.push(['2->1', v.channel, v.type, v.data && JSON.parse(v.data)]);
    }));
    channelSubs.add(store2Subs)

    channelSubs.add(store1Subs)

    const a = newJson<xn>({ x: 5 });
    const b = newJson<xn>({ x: 10 });
    const c = newJson<xn>({ x: 20 });
    const arg = newArray<[xn, xn]>([a, b]);
    const subs = arg.subscribe();
    let firstCallResult: xn[][] = [];

    store1.remote(
      fMul, arg, null, callHandler
    ).pipe(alternMap(ref => store1.getValue(ref)[0]), take(2), map(v => v.slice()), toArray()).subscribe(
      v => firstCallResult = v
    );

    const receivedValues: xn[][] = [];
    // STORE1
    const ret = store1.remote(fMul, arg, null, callHandler).pipe(alternMap(ref => store1.getValue(ref)[0]));
    ret.subscribe(async function (this: SafeSubscriber<xn>, v) {
      receivedValues.push(v.slice());
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
      setTimeout(() => {
        channelSubs.unsubscribe();
        done({
          firstCall, secondCall, allMsgs, remainingKeys: [...store1['map'].keys()], remainingKeys2: [...store2['map'].keys()]
        })
      }, 10);
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
        // const { allMsgs } = await p;
        // checkMsgs(allMsgs);
        const { remainingKeys2 } = await p;
        expect(remainingKeys2).deep.eq([]);
      })
      it('should not keep resources after the call', async () => {
        const { remainingKeys } = await p;
        expect(remainingKeys).deep.eq([]);
      })
    })
  });
});

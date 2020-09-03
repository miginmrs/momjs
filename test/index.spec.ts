import { expect } from 'chai';
import { Store } from '../source/store';
import { JsonCim, JsonTypeKeys, ArrayTypeKeys, ArrayCim, JsonHandler, F_Ref, F_Destructable, F_ID, F_C } from '../source/handlers';
import { TestScheduler } from 'rxjs/testing';
import {
  Destructable, AppX, ObsWithOrigin, CtxH, Ref, EHConstraint, DeepDestructable, TypedDestructable,
  GlobalRef, DestructableCtr, wrapJson, ArrayHandler, wrapArray, JsonDestructable, ArrayDestructable,
  Json, TVCDA_CIM, TVCDADepConstaint, CallHandler, JsonObject
} from '../source';
import { Subscription, ObservedValueOf, Observable, Subject, interval, config } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { current } from '../utils/rx-utils';
import { asyncDepMap } from 'dependent-type/dist/cjs/map';
import { startListener, DataGram, createCallHandler } from '../source/proxy'

type ToRef1<X> = Ref<any>[] & { [P in keyof X]: Ref<X[P]> }
type ToRef2<X> = ToRef1<X[Exclude<keyof X, keyof any[]>]>[] & { [P in Exclude<keyof X, keyof any[]>]: ToRef1<X[P]> };
declare const F_Destructable2: unique symbol;
declare const F_ArrArgs2: unique symbol;
declare const F_Ref2: unique symbol;
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_Destructable2]: DeepDestructable<C[0 & keyof C][keyof C[0 & keyof C]] & any[], 1, C[1 & keyof C], C[2 & keyof C]>,
    [F_ArrArgs2]: ToRef2<X>,
    [F_Ref2]: ToRef1<C[X & keyof C]>,
  }
}
type ArrayTypeKeys2 = {
  T: typeof F_ArrArgs2;
  V: typeof F_ID;
  C: typeof F_C;
  D: typeof F_C;
  A: typeof F_ID;
}
type ArrayCim2 = { T: [never, Ref<any>[][]], V: [never, any[]], C: [null, null], D: [null, null], A: [never, any[][]] };
const ArrayCtr2: DestructableCtr<any[][], ArrayCim2, ArrayTypeKeys2> = <X extends any[]>(x: X, _d: null, _c: null, old: any[] | null) => {
  if (old) { old.splice(0); x = Object.assign(old, x); }
  return x;
}
const ArrayHandler2 = <EH extends EHConstraint<EH, ECtx>, ECtx>(): CtxH<any[][], ArrayCim2, ArrayTypeKeys2, 2, EH, ECtx> => ({
  decode: ({ deref }) => (_id, data) => ({ args: data.map(refs => refs.map(ref => deref(ref))) as any, data: null, n: 2 }),
  encode: ({ ref }) => async <C extends any[][]>({ args }: { args: DeepDestructable<C, 2, EH, ECtx> }): Promise<ToRef2<C>> => {
    type PC = { [P in Exclude<keyof C, keyof any[]>]: C[P] };
    type cim = [
      [[PC, EH, ECtx], DeepDestructable<PC[keyof PC] & any[], 1, EH, ECtx>],
      [PC, ToRef1<PC[keyof PC]>]
    ];
    type k = [typeof F_Destructable2, typeof F_Ref2];
    return await asyncDepMap<keyof PC, cim, k>(args, async <X extends keyof PC>(arg: DeepDestructable<PC[], 1, EH, ECtx>): Promise<AppX<1, cim, k, X>> => {
      const item: ToRef1<PC[X]> = await asyncDepMap<
        keyof PC[X], [
          [[PC[X], EH, ECtx], TypedDestructable<PC[X][keyof PC[X]], EH, ECtx>],
          [PC[X], Ref<PC[X][keyof PC[X]]>]
        ], [typeof F_Destructable, typeof F_Ref]>(arg, ref);
      return item;
    });
  },
  ctr: ArrayCtr2,
});


namespace RequestHandlers {
  export const Array: CtxH<any[], ArrayCim, ArrayTypeKeys, 1, RH, {}> = ArrayHandler<RH, {}>();
  export const Json: CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, RH, {}> = JsonHandler<RH, {}>();
  export const Array2: CtxH<any[][], ArrayCim2, ArrayTypeKeys2, 2, RH, {}> = ArrayHandler2<RH, {}>();
}
type RH = typeof RequestHandlers;


const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).deep.equal(expected);
});


describe('Store', () => {
  const store = new Store(RequestHandlers, { someData: 1 })
  describe('first entry', () => {
    const init = () => {
      const [x1] = store.unserialize<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [{ x: number }], [1]>([{
        type: 'Json', data: { x: 1 }, c: null, i: 0 as const
      }])!;
      const obs = store.getValue(x1)[0];
      return [x1, obs] as const;
    };
    let x1: ReturnType<typeof init>[0];
    let obs: ReturnType<typeof init>[1];
    before(() => {
      [x1, obs] = init();
    });
    it('should start by id = 1', () => {
      expect(x1.id).equal('1');
    });
    it('should store value', () => {
      var n: number = 0;
      obs.subscribe(({ x }) => n = x).unsubscribe()
      expect(n).equal(1);
    });
    it('should push new values', () => {
      var n: number[] = [];
      const subs = obs.subscribe(({ x }) => n.push(x));
      store.unserialize<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [{ x: number }], [1]>([{
        type: 'Json', data: { x: 2 }, c: null, i: 0, id: '1', new: false
      }]);
      subs.unsubscribe();
      expect(n).deep.equal([1, 2]);
    });
    it('should not be directly destroyed', () => {
      expect(obs.destroyed).equals(false);
    });
    it('should be removed after unsubscription', () => {
      const notRemovedYet = store.getValue(x1)[1];
      expect(notRemovedYet).not.eq(undefined);
      store.getValue(x1)[1].subscription!.unsubscribe();
      expect(store.get(x1.id)).equals(undefined);
    });
    it('should be destroyed after unsubscription', () => {
      expect(obs.destroyed).equals(true);
    });
    it('should throw error when subscribed after destruction', () => {
      testScheduler.run(helpers => {
        const { expectObservable } = helpers;
        expectObservable(obs).toBe('#', null, { message: 'object unsubscribed', name: 'ObjectUnsubscribedError' });
      });
    });
  });
  describe('second entry', () => {
    const init = () => {
      const [x2, arr] = store.unserialize<0 | 1, [[JsonObject, JsonCim], [any[], ArrayCim]], [JsonTypeKeys, ArrayTypeKeys], [{ x: number }, [{ x: number }]], [1, 1]>(ref => [{
        type: 'Json', data: { x: 2 }, c: null, i: 0, new: true, id: '1'
      }, {
        type: 'Array', data: [ref(0)], c: null, new: true, i: 1,
      }])!
      return [x2, arr] as const;
    };
    let x2: ReturnType<typeof init>[0];
    let arr: ReturnType<typeof init>[1];
    before(() => {
      [x2, arr] = init();
    });
    it('should prevent first entry from destruction', () => {
      store.getValue(x2)[1].subscription!.unsubscribe();
      const obs = store.getValue(arr)[0];
      expect(obs.destroyed).equals(false);
    });
    it('should chain destruction', () => {
      store.getValue(arr)[1].subscription!.unsubscribe();
      expect(store.get(x2.id)).equals(undefined);
      expect(store.get(arr.id)).equals(undefined);
    });
  });
  type json = { msg: string };
  let jsonObs: JsonDestructable<json, RH, {}>;
  let arr1Obs: ArrayDestructable<[json, json, json], RH, {}>;
  let arr2Obs: ArrayDestructable<[[json, json, json], json], RH, {}>;
  let jsonWrp: ObsWithOrigin<json, RH, {}>;
  let arrWrp: ObsWithOrigin<[[json, json, json], json], RH, {}>;
  let originSubs: Subscription;
  describe('push method', () => {
    const handlers = RequestHandlers;
    let subs: Subscription;
    it('should chain insertion', () => {
      jsonObs = wrapJson({ msg: 'hi' }, handlers);
      jsonWrp = store.push(jsonObs).wrapped;
      expect(jsonWrp).not.eq(jsonObs);
      expect(jsonWrp.origin).eq(jsonObs);
      const subs0 = jsonWrp.subscribe(() => { });
      expect([...(store['map']['byId']).keys()]).deep.eq(['3']);
      arr1Obs = wrapArray([jsonObs, jsonObs, jsonObs], handlers);
      arr2Obs = wrapArray([arr1Obs, jsonObs], handlers)
      arrWrp = store.push(arr2Obs).wrapped;
      expect(arrWrp).not.eq(arr2Obs);
      expect(arrWrp.origin).eq(arr2Obs);
      subs = arrWrp.subscribe(() => { });
      subs0.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq(['3', '4', '5']);
    });
    it('should chain only destruction of wrappers', async () => {
      originSubs = arr2Obs.subscribe(() => { });
      subs.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq([]);
      expect([jsonObs.destroyed, arr1Obs.destroyed, arr2Obs.destroyed]).deep.eq([false, false, false]);
      expect([jsonWrp.destroyed, arrWrp.destroyed]).deep.eq([true, true]);
    });
  });
  describe('serialize method', () => {
    const serialize = () => store.serialize(arr2Obs);
    let def: ObservedValueOf<ReturnType<typeof serialize>>;
    it('should recursively encode dependencies', async () => {
      def = await serialize().pipe(take(1)).toPromise();
      expect(def).not.eq(null);
      const jsonRef = { '$': 2 };
      expect(def).deep.eq([{
        i: 0, type: 'Array', c: null, id: '4', data: [{ '$': 1 }, jsonRef], new: true
      }, {
        i: 1, type: 'Array', c: null, id: '5', data: [jsonRef, jsonRef, jsonRef], new: false
      }, {
        i: 2, type: 'Json', c: null, id: '3', data: { msg: 'hi' }, new: false
      }]);
    });
    const unserialize = () => store.unserialize<0, [[any[], ArrayCim]], [ArrayTypeKeys], [[[json, json, json], json]], [1]>(def!)!;
    let ref: ReturnType<typeof unserialize>[0];
    it('should provide correct inputs for unserialize', async () => {
      [ref] = unserialize();
      expect(current(store.getValue(ref)[0])).deep.eq([
        [{ msg: 'hi' }, { msg: 'hi' }, { msg: 'hi' }],
        { msg: 'hi' }
      ]);
    });
    it('should not depend on original observables', async () => {
      originSubs.unsubscribe();
      expect([jsonObs.destroyed, arr1Obs.destroyed, arr2Obs.destroyed]).deep.eq([true, true, true]);
      [arrWrp] = store.getValue(ref);
      jsonWrp = arrWrp.origin.subject.value.args[1] as ObsWithOrigin<json, RH, {}>;
      expect([jsonWrp.destroyed, jsonWrp.destroyed]).deep.eq([false, false]);
    });
    it('should chain destruction', () => {
      store.getValue(ref)[1].subscription?.unsubscribe();
      expect([jsonWrp.destroyed, jsonWrp.destroyed]).deep.eq([true, true]);
      //jsonObs = store.getValue()
    });
  });
  describe('Double dimension destructable', () => {
    it('should go to the correct depth', () => {
      const handlers = RequestHandlers;
      jsonObs = new Destructable(handlers, 'Json', null, { args: [] as [], data: { msg: 'hi' }, n: 1 });
      const rf: GlobalRef<json> = store.push(jsonObs).ref;
      const [ref] = store.unserialize<0, [[any[], ArrayCim2]], [ArrayTypeKeys2], [[[json]]], [2]>([{
        c: null, i: 0, type: 'Array2', data: [[rf]]
      }])!;
      const obs: Observable<[[json]]> = store.getValue(ref)[0];
      expect(current(obs)).deep.eq([[{ msg: 'hi' }]]);
    })
  })
});
describe.only('Stores Communication', () => {
  it('should work', (done) => {
    const handlers = RequestHandlers;
    type xn = { x: number };

    // COMMON
    const fId = 0;
    type msg1to2 = 'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call';
    const store1_to_store2 = new Subject<DataGram<msg1to2>>();
    type msg2to1 = 'response_put' | 'response_call' | 'call_error' | 'call_complete';
    const store2_to_store1 = new Subject<DataGram<msg2to1>>();
    const channel = [0] as [0];
    const msgs: (['1->2', number, msg1to2, Json] | ['2->1', number, msg2to1, Json])[] = [];
    const expectedMsgs: typeof msgs = [['1->2', 0, 'put', [
      { i: 0, type: 'Array', data: [{ $: 1 }, { $: 2 }], c: null, new: true },
      { i: 1, type: 'Json', data: { x: 5 }, c: null, new: false },
      { i: 2, type: 'Json', data: { x: 10 }, c: null, new: false },
    ]], ['2->1', 0, 'response_put', [
      { id: '1' }, { id: '2' }, { id: '3' }
    ]], ['1->2', 1, 'call', {
      fId: 0, param: null, argId: '1'
    }], ['2->1', 1, 'response_call', [
      { i: 0, type: 'Json', data: { x: 50 }, c: null, id: 4, new: true }
    ]], ['1->2', 0, 'put', [
      { i: 0, type: 'Array', data: [{ $: 1 }, { id: '3' }], c: null, id: '1', new: false },
      { i: 1, type: 'Json', data: { x: 4 }, c: null, id: '2', new: false }
    ]], ['2->1', 1, 'response_call', {
      i: 0, type: 'Json', data: { x: 40 }, c: null, id: '4', new: false
    }], ['2->1', 0, 'response_put', [
      { id: '1' }, { id: '2' }
    ]]];
    store1_to_store2.subscribe(v => {
      if (msgs.length === expectedMsgs.length -1 ) debugger;
      msgs.push(['1->2', v.channel, v.type, JSON.parse(v.data)]);
      console.log('store1', '->', 'store2', v.channel, v.type, v.data)
    });
    store2_to_store1.subscribe(v => {
      if (msgs.length === expectedMsgs.length -1 ) debugger;
      msgs.push(['2->1', v.channel, v.type, JSON.parse(v.data)]);
      console.log('store2', '->', 'store1', v.channel, v.type, v.data)
    });

    // STORE2

    const store2 = new Store(handlers, {}, 'store2');
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



    const store1 = new Store(handlers, {}, 'store1');
    const a = wrapJson<xn, RH, {}>({ x: 5 }, handlers);
    const b = wrapJson<xn, RH, {}>({ x: 10 }, handlers);
    const c = wrapJson<xn, RH, {}>({ x: 20 }, handlers);
    const arg = wrapArray<[xn, xn], RH, {}>([a, b], handlers);
    const subs = arg.subscribe();

    // store1.remote<JsonObject, JsonCim, JsonTypeKeys, xn, 1>()(
    //   fId, arg, null, createCallHandler(store1_to_store2, store2_to_store1, channel)
    // ).pipe(take(1)).subscribe(v => {
    //   console.log('---', v)
    // });

    const warn = console.warn;
    console.warn = () => { };
    config.useDeprecatedSynchronousErrorHandling = true;
    console.warn = warn;

    const receivedValues: xn[] = [];
    // STORE1
    store1.remote<JsonObject, JsonCim, JsonTypeKeys, xn, 1>()(
      fId, arg, null, createCallHandler(store1_to_store2, store2_to_store1, channel)
    ).subscribe(v => {
      console.log([...store1['map'].keys()], v);
      receivedValues.push({ ...v });
      if (v.x !== 50) return;
      // await new Promise(r => setTimeout(r, 1));
      a.subject.next({ data: { x: 4 }, args: [], n: 1 });
      // await new Promise(r => setTimeout(r, 1));
      a.subject.next({ data: { x: 3 }, args: [], n: 1 });
      // await new Promise(r => setTimeout(r, 1));
      arg.subject.next({ data: null, n: 1, args: [c, b] })
      // await new Promise(r => setTimeout(r, 1));
      c.subject.next({ data: { x: 30 }, args: [], n: 1 });
      // await new Promise(r => setTimeout(r, 1));
      b.subject.complete();
    }, () => { }, () => {
      console.log('[[[[[[[]]]]]]]', receivedValues)
      //expect(receivedValues).deep.eq([{ x: 50 }, { x: 40 }, { x: 30 }, { x: 200 }, { x: 300 }]);
      // setTimeout(()=>console.log([...store1['map'].keys()]), 10);
      // expect([...store1['map'].keys()]).deep.eq([]);
      done();
    });
    subs.unsubscribe();
  })
});
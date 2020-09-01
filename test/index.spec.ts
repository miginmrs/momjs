import { expect } from 'chai';
import { Store } from '../source/store';
import { JsonCim, JsonTypeKeys, JsonObject, ArrayTypeKeys, ArrayCim, JsonCtr, JsonHandler, ToRef, F_Ref, F_Destructable, F_ID, F_C } from '../source/handlers';
import { TestScheduler } from 'rxjs/testing';
import { Destructable, ModelsDefinition, AppX, ObsWithOrigin, EModelsDefinition, CtxH, Ref, EHConstraint, DeepDestructable, TypedDestructable, TypeFuncs, KeysOfType, GlobalRef, DestructableCtr, wrapJson, ArrayHandler, wrapArray, JsonDestructable, ArrayDestructable, Json, TVCDA_CIM, TVCDADepConstaint } from '../source';
import { Subscription, ObservedValueOf, Observable, Subscriber, Subject } from 'rxjs';
import { take, tap, map, filter } from 'rxjs/operators';
import { current } from '../utils/rx-utils';
import { asyncDepMap } from 'dependent-type/dist/cjs/map';
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
      const subs0 = jsonWrp.subscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq(['3']);
      arr1Obs = wrapArray([jsonObs, jsonObs, jsonObs], handlers);
      arr2Obs = wrapArray([arr1Obs, jsonObs], handlers)
      arrWrp = store.push(arr2Obs).wrapped;
      expect(arrWrp).not.eq(arr2Obs);
      expect(arrWrp.origin).eq(arr2Obs);
      subs = arrWrp.subscribe();
      subs0.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq(['3', '4', '5']);
    });
    it('should chain only destruction of wrappers', async () => {
      originSubs = arr2Obs.subscribe();
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
describe('Stores Communication', () => {
  it('should work', () => {
    const handlers = RequestHandlers;
    type xn = { x: number };

    // COMMON
    const fId = 0;
    const makePromise = <T>(res?: (x: T) => void) => [new Promise<T>(r => res = r), res!] as const;
    type DataGram<T extends string> = { channel: number, type: T, data: string };
    const store1_to_store2 = new Subject<DataGram<'put' | 'unsubscribe' | 'error' | 'complete' | 'call' | 'end_call'>>();
    const store2_to_store1 = new Subject<DataGram<'response_put' | 'response_call' | 'call_error' | 'call_complete'>>();


    // STORE2
    {
      const store2 = new Store(handlers, {});
      store2.functions[fId] = (_, v) => {
        const [{ x: a }, { x: b }]: [xn, xn] = current(v);
        const subs = new Subscription();
        const obs = wrapJson<xn, RH, {}>({ x: a * b }, handlers, subs);
        subs.add(v.subscribe(
          ([{ x: a }, { x: b }]) => obs.subject.next({
            args: [], data: { x: a * b }, n: 1
          }),
          e => obs.subject.error(e),
          () => obs.subject.complete()
        ));
        return obs;
      };
      store1_to_store2.subscribe(({ channel, type, data }) => {
        console.log(channel, type, data)
        if (type === 'put') {
          const refs = store2.unserialize(JSON.parse(data))!
          console.log('sending back', { channel, type: 'response_put', data: JSON.stringify(refs) })
          store2_to_store1.next({ channel, type: 'response_put', data: JSON.stringify(refs) });
        };
        if (type === 'unsubscribe') {
          store2.get(data)?.[1].subscription?.unsubscribe()
        };
        if (type === 'error') {
          const { id, msg } = JSON.parse(data);
          const obs = store2.get(id)?.[0];
          if (!obs) return;
          (obs as typeof obs.origin)?.subject.error(msg);
        };
        if (type === 'complete') {
          const obs = store2.get(data)?.[0];
          if (!obs) return;
          (obs as typeof obs.origin).subject.complete();
        }
        if (type === 'call') {
          const { fId, param, argId } = JSON.parse(data);
          console.log('calling', fId, param, argId)
          const endCallSubs = store1_to_store2.pipe(filter(x => x.channel === channel && x.type === 'end_call')).subscribe(() => {
            subs.unsubscribe();
          });
          const subs = store2.call(fId, param, { id: argId } as GlobalRef<any>).subscribe(def => {
            store2_to_store1.next({ channel, type: 'response_call', data: JSON.stringify(def) });
          }, err => {
            store2_to_store1.next({ channel, type: 'call_error', data: `${err}` });
          }, () => {
            store2_to_store1.next({ channel, type: 'call_complete', data: '' });
          });
          subs.add(endCallSubs);
        }
      })
    }


    const store1 = new Store(handlers, {});
    const a = wrapJson<xn, RH, {}>({ x: 5 }, handlers);
    const b = wrapJson<xn, RH, {}>({ x: 10 }, handlers);
    const arg = wrapArray<[xn, xn], RH, {}>([a, b], handlers);
    // STORE1
    (<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, P extends Json,
      dom2, cim2 extends TVCDA_CIM, k2 extends TVCDADepConstaint<dom2, cim2>, X2 extends dom2, n2 extends 1 | 2
    >(
      arg: Destructable<dom, cim, k, X, n, RH, {}>, param: P, op: {
        end_call: () => void,
        call_unsubscribe: (ref: GlobalRef<AppX<'V', cim, k, X>>) => void,
        call_complete: (ref: GlobalRef<AppX<'V', cim, k, X>>) => void,
        put: (def: EModelsDefinition<0, [[dom, cim]], [k], [X], [n], RH, {}>) => void,
        call: (fId: number, param: P, ref: GlobalRef<AppX<"V", cim, k, X>>) => void,
        error: (ref: GlobalRef<AppX<'V', cim, k, X>>, err: any) => void,
        subscribeToResult: (cbs: {
          resp_call: (data: ModelsDefinition<0, [[dom2, cim2]], [k2], [X2], [n2], typeof RequestHandlers, {}>) => void;
          err_call: (err: any) => void;
          comp_call: () => void;
        }) => Subscription
      }
    ) => {
      type V = AppX<'V', cim, k, X>;
      const [promise, resolve] = makePromise<GlobalRef<V>>();
      const ids = new WeakMap<TypedDestructable<any, RH, {}>, string>();
      const callSubscription = new Subscription();
      const paramSubs = store1.serialize(arg, obs => {
        const resolver = store1.getResolver(obs);
        const withInsertion: typeof resolver = ref => {
          ids.set(obs, ref.id);
          resolver(ref);
        };
        return withInsertion;
      }).subscribe(
        async function (def) {
          const responsePromise = store2_to_store1.pipe(filter(m => m.channel === 0), take(1)).toPromise();
          op.put(def);
          const response = await responsePromise;
          expect(response.type).eq('response_put');
          const refs: { 0: GlobalRef<V>; } & GlobalRef<any>[] = JSON.parse(response.data);
          console.log(response.data)
          refs.forEach((ref, i) => def[i]?.resolve?.(ref));
          resolve(refs[0]);
        },
        e => promise.then(refArg => op.error(refArg, e)),
        () => promise.then(refArg => op.call_complete(refArg)),
      );
      promise.then(refArg => {
        callSubscription.add(() => promise.then(() => {
          if (paramSubs.closed) return;
          op.call_unsubscribe(refArg);
          paramSubs.unsubscribe();
        }));
        if (paramSubs.closed) {
          callSubscription.unsubscribe();
          return;
        }
        store1.push(arg, ids).wrapped.subscribe(v => {
        });
        const refTask = makePromise<GlobalRef<any>>();
        const responseSubs = op.subscribeToResult({
          resp_call: (data) => {
            const ref = store1.unserialize(data)[0];
            responseSubs.add(store1.getValue(ref)[1].subscription);
            refTask[1](ref);
          },
          err_call: (err) => {
            refTask[0].then(ref => {
              const obs = store1.getValue(ref)[0];
              (obs as typeof obs.origin).subject.error(err);
            })
          },
          comp_call: () => {
            refTask[0].then(ref => {
              const obs = store1.getValue(ref)[0];
              (obs as typeof obs.origin).subject.complete();
            })
          }
        });
        callSubscription.add(() => {
          if (!responseSubs.closed) op.end_call()
        });
        callSubscription.add(responseSubs);
        responseSubs.add(callSubscription);
        op.call(fId, param, refArg);
        return refTask[0];
      }).then(ref => {
        if (!ref) return;
        const subs = store1.getValue(ref)[0].subscribe(v => console.log('****', v), console.error, () => console.log('*** End'));
        a.subject.next({ data: { x: 4 }, args: [], n: 1 });
        a.subject.next({ data: { x: 3 }, args: [], n: 1 });
        a.subject.complete();
      });
      const subscription = callSubscription;
    })(arg, null, {
      end_call: () => store1_to_store2.next({ channel: 1, type: 'end_call', data: '' }),
      call_unsubscribe: ref => store1_to_store2.next({ channel: 0, data: ref.id, type: 'unsubscribe' }),
      call_complete: ref => store1_to_store2.next({ channel: 0, data: ref.id, type: 'complete' }),
      put: (def) => store1_to_store2.next({ channel: 0, type: 'put', data: JSON.stringify(def) }),
      call: (fId, param, argId) => store1_to_store2.next({ channel: 1, data: JSON.stringify({ fId, param, argId }), type: 'call' }),
      error: (ref, e) => store1_to_store2.next({ channel: 0, data: JSON.stringify({ id: ref.id, msg: `${e}` }), type: 'error' }),
      subscribeToResult: cbs => store2_to_store1.pipe(filter(x => x.channel === 1)).subscribe(
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
    })
  })
});
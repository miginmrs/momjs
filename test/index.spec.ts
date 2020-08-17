import { expect } from 'chai';
import { Store } from '../source/core';
import { JsonCim, JsonTypeKeys, JsonObject, ArrayTypeKeys, ArrayCim } from '../source/handlers';
import { config } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { Ref } from '../source/types';

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).deep.equal(expected);
});


describe("Store", function () {
  const store = new Store({})
  describe("first entry", function () {
    const init = () => {
      const [x1] = store.unserialize<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [{ x: number }]>([{
        type: 'Json', data: { x: 1 }, c: null, i: 0 as const
      }])!;
      const obs = store.getValue(x1)[0];
      return [x1, obs] as const;
    };
    let x1: ReturnType<typeof init>[0];
    let obs: ReturnType<typeof init>[1];
    before(function () {
      [x1, obs] = init();
    });
    it("should start by id = 1", function () {
      expect(x1.id).equal('1');
    });
    it("should store value", function () {
      var n: number = 0;
      obs.subscribe(({ x }) => n = x).unsubscribe()
      expect(n).equal(1);
    });
    it("should push new values", function () {
      var n: number[] = [];
      const subs = obs.subscribe(({ x }) => n.push(x));
      store.unserialize<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [{ x: number }]>([{
        type: 'Json', data: { x: 2 }, c: null, i: 0, reuseId: '1', isNew: false
      }]);
      subs.unsubscribe();
      expect(n).deep.equal([1, 2]);
    });
    it("should not be directly destroyed", function () {
      expect(obs.destroyed).equals(false);
    });
    it("should be removed after unsubscription", function () {
      store.getValue(x1)[1]!.unsubscribe();
      expect(store.get(x1.id)).equals(undefined);
    });
    it("should be destroyed after unsubscription", function () {
      expect(obs.destroyed).equals(true);
    });
    it("should throw error when subscribed after destruction", function () {
      testScheduler.run(helpers => {
        const { expectObservable } = helpers;
        expectObservable(obs).toBe('#', null, { message: "object unsubscribed", name: "ObjectUnsubscribedError" });
      });
    });
  });
  describe("second entry", function () {
    const init = () => {
      const [x2, arr] = store.unserialize<0 | 1, [[JsonObject, JsonCim], [any[], ArrayCim]], [JsonTypeKeys, ArrayTypeKeys], [{ x: number }, [{ x: number }]]>(ref => [{
        type: 'Json', data: { x: 2 }, c: null, i: 0, isNew: true, reuseId: '1'
      }, {
        type: 'Array', data: [ref(0)], c: null, isNew: true, i: 1,
      }])!
      return [x2, arr] as const;
    };
    let x2: ReturnType<typeof init>[0];
    let arr: ReturnType<typeof init>[1];
    before(function () {
      [x2, arr] = init();
    });
    it("should keep first entry from destruction", function () {
      store.getValue(x2)[1]!.unsubscribe();
      const obs = store.getValue(arr)[0];
      expect(obs.destroyed).equals(false);
    });
    it("should chain destruction", function () {
      store.getValue(arr)[1]!.unsubscribe();
      expect(store.get(x2.id)).equals(undefined);
      expect(store.get(arr.id)).equals(undefined);
    });
  });
});

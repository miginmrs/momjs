import { expect } from "chai";
import { msg, start, MsgGenerator, parallel } from "./common";

export const checkMsgs = (msgs: msg[]) => {
  const init = Symbol();
  type dir = 'call1' | 'call2' | 'put1' | 'put2' | 'put3' | 'put4';
  type init = typeof init; type path = dir | init;
  type Handler = Generator<path | undefined, void, msg>;
  const handlers: Handler[] = [];
  let ids: Partial<Record<'a' | 'b' | 'c' | 'arg', string>> = {}, usedIds = new Set<string>();
  type idstr = { id: string };
  const linkTo = (ch: number, dir: dir) => handlers.unshift(start(function* (): Handler {
    let msg = yield null!;
    while (true) msg = yield msg[1] === ch ? dir : undefined
  }));
  const gen: MsgGenerator = parallel<path>(msg => {
    for (const [index, h] of [...handlers.entries()].reverse()) {
      const v = h.next(msg);
      if (v.done) { handlers.splice(index, 1); continue; }
      if (v.value) return v.value;
    }
    return init;
  }, {
    [init]: start(function* (): MsgGenerator {
      const [, first, , data] = yield null!;
      const tIds = [ids.arg, ids.a, ids.b] = (data as idstr[]).map(({ id }) => id), [idArg, idA, idB] = tIds;
      if (!tIds.every(id => usedIds.add(id))) {
        throw new Error('some ids are reused');
      }
      yield ['1->2', first, 'put', [
        { i: 0, type: 'Array', data: [{ '$': 1 }, { '$': 2 }], c: null, new: true, id: idArg },
        { i: 1, type: 'Json', data: { x: 5 }, c: null, new: false, id: idA },
        { i: 2, type: 'Json', data: { x: 10 }, c: null, new: false, id: idB }
      ]];
      handlers.unshift(start(function* (): Handler { while ((yield)[2] !== 'call'); yield 'call1' }));
      handlers.unshift(start(function* (): Handler { while ((yield)[2] !== 'call'); yield 'call2' }));
      const [, put1] = yield ['2->1', first, 'response_put', [{ id: idArg }, { id: idA }, { id: idB }]];
      linkTo(put1, 'put1');
      const [, put2] = yield ['1->2', put1, 'put', [
        { i: 0, type: 'Array', data: [{ '$': 1 }, { id: idB }], c: null, id: idArg, new: false },
        { i: 1, type: 'Json', data: { x: 4 }, c: null, new: false, id: idA }
      ]];
      linkTo(put2, 'put2');
      const [, put3, , data3] = yield ['1->2', put2, 'put', [
        { i: 0, type: 'Array', data: [{ '$': 1 }, { id: idB }], c: null, id: idArg, new: false },
        { i: 1, type: 'Json', data: { x: 3 }, c: null, new: false, id: idA }
      ]];
      linkTo(put3, 'put3');
      const idC = (data3 as idstr[])[1].id;
      if (!usedIds.add(idC)) throw new Error('id already used');
      ids.c = idC;
      const [, put4] = yield ['1->2', put3, 'put', [
        { i: 0, type: 'Array', data: [{ '$': 1 }, { id: idB }], c: null, id: idArg, new: false },
        { i: 1, type: 'Json', data: { x: 20 }, c: null, new: false, id: idC }
      ]];
      linkTo(put4, 'put4');
      yield ['1->2', put4, 'put', [
        { i: 0, type: 'Array', data: [{ '$': 1 }, { id: idB }], c: null, id: idArg, new: false },
        { i: 1, type: 'Json', data: { x: 30 }, c: null, id: idC, new: false }
      ]];

    }),
    call1: start(function* (): MsgGenerator {
      const [, ch] = yield null!;
      linkTo(ch, 'call1');
      const argId = ids.arg;
      if (!argId) throw new Error('argId not set');
      const response_call = yield ['1->2', ch, 'call', { fId: 0, param: null, argId }];
      const id = (response_call[3] as [idstr])[0].id;
      if (!usedIds.add(id)) throw new Error('id already used');
      yield ['2->1', ch, 'response_call', [
        { i: 0, type: 'Json', data: { x: 50 }, c: null, id, new: true }
      ]];
      yield ['2->1', ch, 'response_call', [
        { i: 0, type: 'Json', data: { x: 40 }, c: null, id, new: false }
      ]];
      yield ['1->2', ch, 'end_call', ''];
      yield ['1->2', ch, 'unsubscribe', argId]; // the observable 1 is not destroyed at this point, because its used by the fct call 
      yield ['1->2', ch, 'complete', argId];
    }),
    call2: start(function* (): MsgGenerator {
      const [, ch] = yield null!;
      linkTo(ch, 'call2');
      const argId = ids.arg;
      if (!argId) throw new Error('argId not set');
      const response_call = yield ['1->2', ch, 'call', { fId: 0, param: null, argId }];
      const id = (response_call[3] as [idstr])[0].id;
      if (!usedIds.add(id)) throw new Error('id already used');
      yield ['2->1', ch, 'response_call', [
        { i: 0, type: 'Json', data: { x: 50 }, c: null, id, new: true }
      ]];
      yield ['2->1', ch, 'response_call', [
        { i: 0, type: 'Json', data: { x: 40 }, c: null, id, new: false }
      ]];
      yield ['2->1', ch, 'response_call', [
        { i: 0, type: 'Json', data: { x: 30 }, c: null, id, new: false }
      ]];
      yield ['2->1', ch, 'response_call', [
        { i: 0, type: 'Json', data: { x: 200 }, c: null, id, new: false }
      ]];
      yield ['2->1', ch, 'response_call', [
        { i: 0, type: 'Json', data: { x: 300 }, c: null, id, new: false }
      ]];
      yield ['2->1', ch, 'call_complete', ''];
    }),
    put1: start(function* (): MsgGenerator {
      const [, ch] = yield null!;
      yield ['2->1', ch, 'response_put', [{ id: ids.arg! }, { id: ids.a! }]]
    }),
    put2: start(function* (): MsgGenerator {
      const [, ch] = yield null!;
      yield ['2->1', ch, 'response_put', [{ id: ids.arg! }, { id: ids.a! }]]
    }),
    put3: start(function* (): MsgGenerator {
      const [, ch] = yield null!;
      yield ['2->1', ch, 'response_put', [{ id: ids.arg! }, { id: ids.c! }]]
    }),
    put4: start(function* (): MsgGenerator {
      const [, ch] = yield null!;
      yield ['2->1', ch, 'response_put', [{ id: ids.arg! }, { id: ids.c! }]]
    }),
  });
  msgs.forEach((msg, i) => {
    const v = gen.next(msg);
    if (v.done) expect(msgs.slice(i)).deep.eq([]);
    expect(msg).deep.eq(v.value);
  });
  expect([]).deep.eq([...(gen as Generator<msg, void, void>)])
};

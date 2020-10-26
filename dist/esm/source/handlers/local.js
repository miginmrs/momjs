import * as origin from '../origin';
export var local;
(function (local) {
    local.Handler = () => ({
        decode: () => () => ({ args: [], data: {}, c: null, n: 1 }),
        encode: () => () => null,
        ctr: ([], data) => data,
    });
    local.create = (getHandler) => (data, ...teardownList) => new origin.Origin(getHandler, 'Local', null, { args: [], data, n: 1 }, undefined, ...teardownList);
})(local || (local = {}));
//# sourceMappingURL=local.js.map
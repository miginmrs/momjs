import * as origin from '../origin';
export var local;
(function (local) {
    local.n = 1;
    local.Handler = () => ({
        decode: () => () => ({ args: [], data: {}, c: null, n: local.n }),
        encode: () => () => null,
        ctr: ([], data) => data,
    });
    local.create = (getHandler) => (data, ...teardownList) => new origin.Origin(getHandler, 'Local', null, { args: [], data, n: local.n }, undefined, ...teardownList);
})(local || (local = {}));
//# sourceMappingURL=local.js.map
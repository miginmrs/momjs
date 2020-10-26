export const runit = (gen, promiseCtr) => {
    const runThen = (...args) => {
        const v = args.length ? gen.next(args[0]) : gen.next();
        if (v.done)
            return promiseCtr.resolve(v.value);
        return promiseCtr.resolve(v.value).then(runThen);
    };
    return runThen();
};
export function* wait(x) {
    return yield x;
}
export function asAsync(f, promiseCtr, thisArg) {
    return (...args) => runit(f.call(thisArg, ...args), promiseCtr);
}
//# sourceMappingURL=async.js.map
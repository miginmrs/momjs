import { Observable } from 'rxjs';
import { TSerialObs, EHConstraint } from './types/serial';
export declare class BiMap<EH extends EHConstraint<EH, ECtx>, ECtx, D, k = string> {
    readonly watch: boolean;
    private byId;
    private byObs;
    private oldId;
    private _empty;
    readonly empty: Observable<void>;
    constructor(watch?: boolean);
    get(id: k): [TSerialObs<any, EH, ECtx>, D] | undefined;
    delete(id: k): boolean;
    set(id: k, value: [TSerialObs<unknown, EH, ECtx>, D]): void;
    reuseId(obs: TSerialObs<unknown, EH, ECtx>, id: k): void;
    finddir(obs: TSerialObs<unknown, EH, ECtx>): [k, 'up' | 'down' | 'exact'] | undefined;
    find(obs: TSerialObs<unknown, EH, ECtx>, any?: boolean): k | undefined;
    usedId(obs: TSerialObs<unknown, EH, ECtx>): k | undefined;
    get size(): number;
    keys(): IterableIterator<k>;
    entries(): IterableIterator<[k, [TSerialObs<any, EH, ECtx>, D]]>;
    values(): IterableIterator<[TSerialObs<any, EH, ECtx>, D]>;
}

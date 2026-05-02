import { globalCodecEngine, Codec } from './engine.js';

export const DateCodec: Codec<Date> = {
    type: Date,
    tag: 'Date',
    encode: (d) => d.getTime(),
    decode: (v) => new Date(v)
};

export const SetCodec: Codec<Set<any>> = {
    type: Set,
    tag: 'Set',
    encode: (s) => Array.from(s).map(item => globalCodecEngine.encode(item)),
    decode: (v) => new Set(v.map((item: any) => globalCodecEngine.decode(item)))
};

export const MapCodec: Codec<Map<any, any>> = {
    type: Map,
    tag: 'Map',
    encode: (m) => Array.from(m.entries()).map(([k, val]) => [globalCodecEngine.encode(k), globalCodecEngine.encode(val)]),
    decode: (v) => new Map(v.map(([k, val]: any) => [globalCodecEngine.decode(k), globalCodecEngine.decode(val)]))
};

export const ErrorCodec: Codec<Error> = {
    type: Error,
    tag: 'Error',
    encode: (e) => ({ name: e.name, message: e.message, stack: e.stack }),
    decode: (v) => {
        const err = new Error(v.message);
        err.name = v.name;
        err.stack = v.stack;
        return err;
    }
};

globalCodecEngine.register(DateCodec);
globalCodecEngine.register(SetCodec);
globalCodecEngine.register(MapCodec);
globalCodecEngine.register(ErrorCodec);

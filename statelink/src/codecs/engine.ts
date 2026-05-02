export interface Codec<T = any> {
    type: new (...args: any[]) => T; 
    tag: string;
    encode: (val: T) => any;
    decode: (raw: any) => T;
}

export class CodecEngine {
    private codecs = new Map<Function, Codec>();
    private tags = new Map<string, Codec>();

    register(codec: Codec) {
        this.codecs.set(codec.type, codec);
        this.tags.set(codec.tag, codec);
    }

    encode(value: any): any {
        if (value === null || typeof value !== 'object') {
            return value;
        }

        const codec = this.codecs.get(value.constructor);
        if (codec) {
            return { __t: codec.tag, v: codec.encode(value) };
        }

        if (Array.isArray(value)) {
            return value.map(item => this.encode(item));
        }

        if (value.constructor === Object) {
            const res: any = {};
            for (const key in value) {
                res[key] = this.encode(value[key]);
            }
            return res;
        }

        throw new Error(`[Statelink] El tipo '${value.constructor.name}' no es serializable. Registra un codec personalizado o usa .toJSON().`);
    }

    decode(raw: any): any {
        if (raw === null || typeof raw !== 'object') return raw;

        if (raw.__t && this.tags.has(raw.__t)) {
            return this.tags.get(raw.__t)!.decode(raw.v);
        }

        if (Array.isArray(raw)) {
            return raw.map(item => this.decode(item));
        }

        const res: any = {};
        for (const key in raw) {
            // FIX 4: Bloquear Prototype Pollution
            if (key === '__proto__' || key === 'constructor') continue;
            
            res[key] = this.decode(raw[key]);
        }
        return res;
    }
}

export const globalCodecEngine = new CodecEngine();

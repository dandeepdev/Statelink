import { createReactiveProxy } from './core/proxy.js';
import { SubscriberEngine } from './core/subscriber.js';
import { compute, effect } from './core/signal-graph.js';
import { query } from './core/query.js';
import { globalCodecEngine } from './codecs/engine.js';
import './codecs/built-ins.js';

export interface StoreOptions {
    persist?: boolean;
    key?: string;
    version?: number;
    migrate?: (oldState: any, oldVersion: number) => any;
}

export interface PlatformAdapter {
    load: (key: string, initialState: any) => any;
    initPersistence: (key: string, engine: SubscriberEngine) => void;
}

let activeAdapter: PlatformAdapter | null = null;

export function configureAdapter(adapter: PlatformAdapter) {
    activeAdapter = adapter;
}

export function store<T extends object>(initialState: T, options?: StoreOptions) {
    let state = initialState;

    if (options?.persist && options.key && activeAdapter) {
        state = activeAdapter.load(options.key, initialState);
    }

    const engine = new SubscriberEngine();
    
    Object.defineProperty(state, 'subscribe', {
        value: (fn: (state: T) => void) => engine.subscribe(fn),
        enumerable: false, 
        writable: false,
        configurable: true
    });

    const reactiveState = createReactiveProxy(state, engine);
    engine.stateRef = reactiveState;

    if (options?.persist && options.key && activeAdapter) {
        activeAdapter.initPersistence(options.key, engine);
    }

    return reactiveState as T & { subscribe: (fn: (state: T) => void) => () => void };
}

export { compute, effect, query, encodeState, decodeState };
function encodeState(state: any) { return globalCodecEngine.encode(state); }
function decodeState(raw: any) { return globalCodecEngine.decode(raw); }

import { SubscriberEngine } from './subscriber.js';
import { globalGraph } from './signal-graph.js';

function createReactiveCollection(target: Set<any> | Map<any, any>, engine: SubscriberEngine) {
    const handlers: ProxyHandler<any> = {
        get(obj, prop, receiver) {
            if (prop === 'size') {
                globalGraph.track(obj, 'size');
                return Reflect.get(obj, prop, obj);
            }

            const value = Reflect.get(obj, prop, obj);
            if (typeof value !== 'function') return value;
            if (prop === 'constructor') return value;

            if (obj instanceof Set) {
                if (prop === 'add') {
                    return function(val: any) { obj.add(val); globalGraph.trigger(obj, 'size'); globalGraph.trigger(obj, 'values'); engine.notify(); return receiver; };
                }
                if (prop === 'delete') {
                    return function(val: any) { const res = obj.delete(val); globalGraph.trigger(obj, 'size'); globalGraph.trigger(obj, 'values'); engine.notify(); return res; };
                }
                if (prop === 'clear') {
                    return function() { obj.clear(); globalGraph.trigger(obj, 'size'); globalGraph.trigger(obj, 'values'); engine.notify(); };
                }
                if (prop === 'has') {
                    return function(val: any) { globalGraph.track(obj, 'values'); return obj.has(val); };
                }
                if (prop === 'values' || prop === 'keys' || prop === Symbol.iterator) {
                    return function() {
                        globalGraph.track(obj, 'values');
                        const it = obj.values();
                        return {
                            next: () => { const res = it.next(); if (!res.done) res.value = createReactiveProxy(res.value, engine); return res; },
                            [Symbol.iterator]() { return this; }
                        };
                    };
                }
                if (prop === 'entries') {
                    return function() {
                        globalGraph.track(obj, 'values');
                        const it = obj.entries();
                        return {
                            next: () => { const res = it.next(); if (!res.done) { res.value = [createReactiveProxy(res.value[0], engine), createReactiveProxy(res.value[1], engine)]; } return res; },
                            [Symbol.iterator]() { return this; }
                        };
                    };
                }
                if (prop === 'forEach') {
                    return function(cb: any, thisArg?: any) {
                        globalGraph.track(obj, 'values');
                        obj.forEach((val: any, key: any) => cb.call(thisArg, createReactiveProxy(val, engine), createReactiveProxy(key, engine), receiver));
                    };
                }
            }

            if (obj instanceof Map) {
                if (prop === 'set') {
                    return function(key: any, val: any) { obj.set(key, val); globalGraph.trigger(obj, key); globalGraph.trigger(obj, 'size'); globalGraph.trigger(obj, 'values'); engine.notify(); return receiver; };
                }
                if (prop === 'delete') {
                    return function(key: any) { const res = obj.delete(key); globalGraph.trigger(obj, key); globalGraph.trigger(obj, 'size'); globalGraph.trigger(obj, 'values'); engine.notify(); return res; };
                }
                if (prop === 'clear') {
                    return function() { obj.clear(); globalGraph.trigger(obj, 'size'); globalGraph.trigger(obj, 'values'); engine.notify(); };
                }
                if (prop === 'get') {
                    return function(key: any) { globalGraph.track(obj, key); return createReactiveProxy(obj.get(key), engine); };
                }
                if (prop === 'has') {
                    return function(key: any) { globalGraph.track(obj, key); return obj.has(key); };
                }
                if (prop === 'values') {
                    return function() {
                        globalGraph.track(obj, 'values');
                        const it = obj.values();
                        return {
                            next: () => { const res = it.next(); if (!res.done) res.value = createReactiveProxy(res.value, engine); return res; },
                            [Symbol.iterator]() { return this; }
                        };
                    };
                }
                if (prop === 'keys') {
                    return function() {
                        globalGraph.track(obj, 'keys');
                        const it = obj.keys();
                        return {
                            next: () => { const res = it.next(); if (!res.done) res.value = createReactiveProxy(res.value, engine); return res; },
                            [Symbol.iterator]() { return this; }
                        };
                    };
                }
                if (prop === 'entries' || prop === Symbol.iterator) {
                    return function() {
                        globalGraph.track(obj, 'entries');
                        const it = obj.entries();
                        return {
                            next: () => { const res = it.next(); if (!res.done) { res.value = [createReactiveProxy(res.value[0], engine), createReactiveProxy(res.value[1], engine)]; } return res; },
                            [Symbol.iterator]() { return this; }
                        };
                    };
                }
                if (prop === 'forEach') {
                    return function(cb: any, thisArg?: any) {
                        globalGraph.track(obj, 'values');
                        obj.forEach((val: any, key: any) => cb.call(thisArg, createReactiveProxy(val, engine), createReactiveProxy(key, engine), receiver));
                    };
                }
            }

            return value.bind(obj);
        }
    };
    return new Proxy(target, handlers);
}

export function createReactiveProxy<T>(target: T, engine: SubscriberEngine): T {
    if (target === null || typeof target !== 'object') return target;
    
    if (target instanceof Date) return target;

    // Usamos el caché del engine en lugar de global
    if (engine.proxyCache.has(target)) {
        return engine.proxyCache.get(target);
    }

    if (target instanceof Set || target instanceof Map) {
        const collectionProxy = createReactiveCollection(target, engine);
        engine.proxyCache.set(target, collectionProxy);
        return collectionProxy as any;
    }

    const proxy = new Proxy(target as object, {
        get(obj, prop, receiver) {
            globalGraph.track(obj, prop);
            const value = Reflect.get(obj, prop, receiver);
            return createReactiveProxy(value, engine);
        },
        set(obj, prop, value, receiver) {
            const oldVal = Reflect.get(obj, prop, receiver);
            if (oldVal !== value) {
                Reflect.set(obj, prop, value, receiver);
                globalGraph.trigger(obj, prop);
                engine.notify();
            }
            return true;
        }
    });

    engine.proxyCache.set(target, proxy);
    return proxy as any;
}

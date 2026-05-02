import { globalCodecEngine } from '../codecs/engine.js';

export class SubscriberEngine {
    private subs = new Set<Function>();
    private pendingFlush = false;
    public stateRef: any;
    
    // FIX 5: Caché de proxies por instancia de store, no global
    public proxyCache = new WeakMap<object, any>();

    subscribe(fn: Function) {
        this.subs.add(fn);
        return () => this.subs.delete(fn);
    }

    notify() {
        if (this.pendingFlush) return;
        this.pendingFlush = true;

        queueMicrotask(() => {
            this.pendingFlush = false;
            
            // FIX 3: Clonación profunda real usando el CodecEngine para inmutabilidad estricta
            let snapshot;
            try {
                const encoded = globalCodecEngine.encode(this.stateRef);
                snapshot = globalCodecEngine.decode(encoded);
            } catch (err) {
                console.error('[Statelink] Fallback de snapshot por error de codec:', err);
                snapshot = { ...this.stateRef }; 
            }

            // Limpieza de métodos inyectados
            if (snapshot && typeof snapshot === 'object') {
                delete snapshot.subscribe;
            }

            this.subs.forEach(fn => {
                try {
                    fn(snapshot);
                } catch (err) {
                    console.error('[Statelink] Error en suscriptor:', err);
                }
            });
        });
    }
}

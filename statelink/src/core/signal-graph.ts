export interface Effect {
    (): void;
    deps?: Set<Set<Effect>>;
}

export class SignalGraph {
    private activeEffect: Effect | null = null;
    private targetMap = new WeakMap<object, Map<string | symbol, Set<Effect>>>();

    setActiveEffect(effect: Effect | null) {
        this.activeEffect = effect;
    }

    getActiveEffect() {
        return this.activeEffect;
    }

    track(target: object, key: string | symbol) {
        if (!this.activeEffect) return;

        let depsMap = this.targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            this.targetMap.set(target, depsMap);
        }

        let dep = depsMap.get(key);
        if (!dep) {
            dep = new Set();
            depsMap.set(key, dep);
        }

        dep.add(this.activeEffect);
        
        if (!this.activeEffect.deps) {
            this.activeEffect.deps = new Set();
        }
        this.activeEffect.deps.add(dep);
    }

    trigger(target: object, key: string | symbol) {
        const depsMap = this.targetMap.get(target);
        if (!depsMap) return;

        const dep = depsMap.get(key);
        if (dep) {
            const effects = new Set(dep);
            effects.forEach(effect => effect());
        }
    }

    cleanup(effect: Effect) {
        if (effect.deps) {
            effect.deps.forEach(dep => dep.delete(effect));
            effect.deps.clear();
        }
    }
}

export const globalGraph = new SignalGraph();

export const finalizationRegistry = new FinalizationRegistry((effect: Effect) => {
    globalGraph.cleanup(effect);
});

export function compute<T>(getter: () => T) {
    let dirty = true;
    let cachedValue: T;
    const sentinel = {}; // FIX: Objeto centinela para trackear dependencias encadenadas

    const effect: Effect = () => {
        if (!dirty) {
            dirty = true;
            // Propagamos la suciedad a los computeds que dependen de este
            globalGraph.trigger(sentinel, 'value');
        }
    };

    const computedObj = {
        get value() {
            // FIX: Rastrear a cualquiera que lea este computed
            globalGraph.track(sentinel, 'value');

            if (dirty) {
                const prev = globalGraph.getActiveEffect();
                globalGraph.setActiveEffect(effect);
                
                globalGraph.cleanup(effect);

                try {
                    cachedValue = getter();
                } finally {
                    globalGraph.setActiveEffect(prev);
                    dirty = false;
                }
            }
            return cachedValue;
        },
        destroy() {
            globalGraph.cleanup(effect);
            finalizationRegistry.unregister(this);
        }
    };

    // FIX: GC automático evita memory leaks sin intervención humana
    finalizationRegistry.register(computedObj, effect, computedObj);
    
    return computedObj;
}

export function effect(fn: () => void) {
    const e: Effect = () => {
        globalGraph.cleanup(e);
        const prev = globalGraph.getActiveEffect();
        globalGraph.setActiveEffect(e);
        try { fn(); } finally { globalGraph.setActiveEffect(prev); }
    };
    e(); // Ejecución inicial para rastrear
    return () => globalGraph.cleanup(e); // Retorna función destroy
}

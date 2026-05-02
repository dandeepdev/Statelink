import { globalCodecEngine } from '../../codecs/engine.js';
import { StorageDriver } from './storage-driver.js';

// FIX 1: Hidratación recursiva guiada estrictamente por initialState
function hydrate(initial: any, persisted: any): any {
    if (typeof initial !== 'object' || initial === null) return persisted;
    if (initial instanceof Set || initial instanceof Map || initial instanceof Date) return persisted;

    const merged: any = Array.isArray(initial) ? [] : {};
    for (const key of Object.keys(initial)) {
        if (persisted && key in persisted) {
            merged[key] = hydrate(initial[key], persisted[key]);
        } else {
            merged[key] = initial[key];
        }
    }
    return merged;
}

// FIX 2: Pipeline completamente blindado
export function load(key: string, initialState: any, driver: StorageDriver): any {
    try {
        const raw = driver.get(`statelink:${key}`);
        if (!raw) return initialState;

        const parsed = JSON.parse(raw);
        const decoded = globalCodecEngine.decode(parsed);
        return hydrate(initialState, decoded);
    } catch (err) {
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
            console.warn(`[Statelink] Estado corrupto en "${key}", usando initialState.`, err);
        }
        try { driver.remove(`statelink:${key}`); } catch {}
        return initialState;
    }
}

export function save(key: string, state: any, driver: StorageDriver): void {
    try {
        const encoded = globalCodecEngine.encode(state);
        const raw = JSON.stringify(encoded);
        driver.set(`statelink:${key}`, raw);
    } catch (err) {
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
            console.warn(`[Statelink] Error al guardar en "${key}" (¿Cuota excedida?):`, err);
        }
    }
}

export class PersistenceEngine {
    private key: string;
    private driver: StorageDriver;
    private timeout: any;
    private latestState: any;

    constructor(key: string, driver: StorageDriver) {
        this.key = key;
        this.driver = driver;
    }

    scheduleSave(state: any) {
        this.latestState = state;
        if (this.timeout) clearTimeout(this.timeout);
        
        // Debounce de 300ms
        this.timeout = setTimeout(() => {
            this.flush();
        }, 300);
    }

    flush() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this.latestState !== undefined) {
            save(this.key, this.latestState, this.driver);
        }
    }
}

// FIX 3: Red de seguridad con flag de ciclo único
export function registerSaveEvents(flushFn: () => void) {
    if (typeof document === 'undefined') return;

    let savedThisCycle = false;

    const safeFlush = () => {
        if (savedThisCycle) return;
        savedThisCycle = true;
        flushFn();
    };

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            safeFlush();
        } else if (document.visibilityState === 'visible') {
            savedThisCycle = false;
        }
    });

    if (typeof window !== 'undefined') {
        window.addEventListener('pagehide', safeFlush);
    }
}

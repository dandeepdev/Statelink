import { mmkvDriver } from './storage-driver.js';
import { load, PersistenceEngine } from '../web/persistence.js';
import { configureAdapter, PlatformAdapter } from '../../index.js';
import { SubscriberEngine } from '../../core/subscriber.js';

// Simulamos la existencia de AppState de React Native (en runtime esto lo provee RN)
const AppState = typeof global !== 'undefined' && (global as any).AppState 
    ? (global as any).AppState 
    : { addEventListener: () => {} };

const persistEngines = new Set<PersistenceEngine>();

// Red de seguridad de plataforma: Guardar cuando la app de RN se va a background
AppState.addEventListener('change', (nextAppState: string) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
        persistEngines.forEach(pe => pe.flush());
    }
});

const nativeAdapter: PlatformAdapter = {
    load(key: string, initialState: any) {
        // Aprovechamos exactamente el mismo Pipeline de load (try/catch, recursión, fallbacks) de Web
        return load(key, initialState, mmkvDriver);
    },
    initPersistence(key: string, engine: SubscriberEngine) {
        const pe = new PersistenceEngine(key, mmkvDriver);
        persistEngines.add(pe);
        engine.subscribe((snapshot: any) => {
            pe.scheduleSave(snapshot);
        });
    }
};

export function configureStorelink() {
    configureAdapter(nativeAdapter);
}

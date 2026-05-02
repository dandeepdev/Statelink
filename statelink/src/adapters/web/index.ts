import { localStorageDriver } from './storage-driver.js';
import { load, PersistenceEngine, registerSaveEvents } from './persistence.js';
import { configureAdapter, PlatformAdapter } from '../../index.js';
import { SubscriberEngine } from '../../core/subscriber.js';

const persistEngines = new Set<PersistenceEngine>();

registerSaveEvents(() => {
    persistEngines.forEach(pe => pe.flush());
});

const webAdapter: PlatformAdapter = {
    load(key: string, initialState: any) {
        return load(key, initialState, localStorageDriver);
    },
    initPersistence(key: string, engine: SubscriberEngine) {
        const pe = new PersistenceEngine(key, localStorageDriver);
        persistEngines.add(pe);
        engine.subscribe((snapshot: any) => {
            pe.scheduleSave(snapshot);
        });
    }
};

export function configureStorelink() {
    configureAdapter(webAdapter);
}

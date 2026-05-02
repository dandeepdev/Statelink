import { nodeFSDriver } from './storage-driver.js';
import { load, PersistenceEngine } from '../web/persistence.js';
import { configureAdapter, PlatformAdapter } from '../../index.js';
import { SubscriberEngine } from '../../core/subscriber.js';

const persistEngines = new Set<PersistenceEngine>();

// Red de seguridad de plataforma: Guardar cuando el proceso Node se cierra
if (typeof process !== 'undefined') {
    const exitHandler = () => {
        persistEngines.forEach(pe => pe.flush());
    };
    // Atrapamos cierres programados, manuales y señales del sistema
    process.on('exit', exitHandler);
    process.on('SIGINT', () => { exitHandler(); process.exit(); });
    process.on('SIGTERM', () => { exitHandler(); process.exit(); });
}

const nodeAdapter: PlatformAdapter = {
    load(key: string, initialState: any) {
        // Aprovecha la misma lógica de hidratación agnóstica de plataforma
        return load(key, initialState, nodeFSDriver);
    },
    initPersistence(key: string, engine: SubscriberEngine) {
        const pe = new PersistenceEngine(key, nodeFSDriver);
        persistEngines.add(pe);
        engine.subscribe((snapshot: any) => {
            pe.scheduleSave(snapshot);
        });
    }
};

export function configureStorelink() {
    configureAdapter(nodeAdapter);
}

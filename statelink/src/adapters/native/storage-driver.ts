import { StorageDriver } from '../web/storage-driver.js';

// En un entorno de producción, este adaptador usa MMKV:
// import { MMKV } from 'react-native-mmkv';
// const storage = new MMKV();

// Como Statelink no acopla dependencias duras, intentamos requerir el motor síncrono.
let storage: any = null;
try {
    // storage = new (require('react-native-mmkv').MMKV)();
} catch {}

export const mmkvDriver: StorageDriver = {
    get(key: string) {
        if (!storage) return null; // Mock fallback
        return storage.getString(key) || null;
    },
    set(key: string, value: string) {
        if (!storage) return;
        storage.set(key, value);
    },
    remove(key: string) {
        if (!storage) return;
        storage.delete(key);
    }
};

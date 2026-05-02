import { StorageDriver } from '../web/storage-driver.js';
import * as fs from 'fs';
import * as path from 'path';

// Directorio por defecto para almacenar el estado
const DATA_DIR = path.join(process.cwd(), '.statelink');

if (typeof process !== 'undefined') {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

export const nodeFSDriver: StorageDriver = {
    get(key: string) {
        if (typeof process === 'undefined') return null;
        const filePath = path.join(DATA_DIR, `${key.replace(/:/g, '_')}.json`);
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }
        return null;
    },
    set(key: string, value: string) {
        if (typeof process === 'undefined') return;
        const filePath = path.join(DATA_DIR, `${key.replace(/:/g, '_')}.json`);
        fs.writeFileSync(filePath, value, 'utf-8');
    },
    remove(key: string) {
        if (typeof process === 'undefined') return;
        const filePath = path.join(DATA_DIR, `${key.replace(/:/g, '_')}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

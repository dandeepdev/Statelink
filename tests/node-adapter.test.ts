import { expect, test, beforeAll, afterAll } from 'vitest'
import { configureStorelink } from '../src/adapters/node/index.ts'
import { store } from '../src/index.ts'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(process.cwd(), '.statelink')

beforeAll(() => {
    // Limpiar restos de pruebas previas
    if (fs.existsSync(DATA_DIR)) {
        fs.rmSync(DATA_DIR, { recursive: true, force: true })
    }
})

afterAll(() => {
    // Dejar limpio
    if (fs.existsSync(DATA_DIR)) {
        fs.rmSync(DATA_DIR, { recursive: true, force: true })
    }
})

test('Node Adapter: Persistencia Síncrona en Sistema de Archivos', async () => {
    configureStorelink();

    // Arrancamos el store, se debe guardar en el filesystem (DATA_DIR/statelink_backend-settings.json)
    const s = store({ serverConfig: 'port-8080' }, { persist: true, key: 'backend-settings' });
    
    // Mutamos el estado (simulando un cambio en el backend)
    s.serverConfig = 'port-3000';

    // Esperamos que el Debounce Flush actúe
    await new Promise(r => setTimeout(r, 350));

    // Comprobamos la creación física del archivo
    const filePath = path.join(DATA_DIR, `statelink_backend-settings.json`);
    expect(fs.existsSync(filePath)).toBe(true);
    
    // Y verificamos que los Codecs codificaron todo correctamente
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('port-3000');
});

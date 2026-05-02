import { expect, test } from 'vitest'
import { configureStorelink } from '../src/adapters/native/index.ts'
import { mmkvDriver } from '../src/adapters/native/storage-driver.ts'
import { store } from '../src/index.ts'

test('Native Adapter: Contrato idéntico, lógica universal', async () => {
    // 1. Inyectamos un Mock síncrono al Driver MMKV
    const fakeStorage = new Map();
    mmkvDriver.get = (k) => fakeStorage.get(k) || null;
    mmkvDriver.set = (k, v) => fakeStorage.set(k, v);

    // 2. Configuramos el entorno como si estuvieramos en index.js de React Native
    configureStorelink();

    // 3. Escribimos código exactamente igual que en Web
    const s = store({ theme: 'light' }, { persist: true, key: 'app-settings' });
    
    // Mutamos estado
    s.theme = 'dark';

    // 4. Simulamos el paso del tiempo para que el debounce flush actúe
    await new Promise(r => setTimeout(r, 350));

    // 5. El adapter nativo usó MMKV en lugar de localStorage, conservando el codec-engine
    const rawData = fakeStorage.get('statelink:app-settings');
    expect(rawData).toContain('dark');
});

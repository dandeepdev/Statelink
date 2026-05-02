import { expect, test } from 'vitest'
import { load, save } from '../src/adapters/web/persistence.js'
import { StorageDriver } from '../src/adapters/web/storage-driver.js'

test('Web Adapter: Claves fantasma eliminadas recursivamente', () => {
    // Fake Driver para no depender del DOM real en los tests
    const store = new Map<string, string>()
    const driver: StorageDriver = {
        get: (key) => store.get(key) || null,
        set: (key, val) => store.set(key, val),
        remove: (key) => store.delete(key)
    }

    // Simulamos un guardado previo (v1)
    save('test', { user: { name: 'Ana', age: 20 } }, driver)

    // Cargamos con un initialState (v2) que ya no tiene 'age'
    const loaded = load('test', { user: { name: '' } }, driver)
    
    expect(loaded.user.name).toBe('Ana')
    // El 'age' fue descartado silenciosamente porque no existe en v2
    expect(loaded.user.age).toBeUndefined()
})

test('Web Adapter: Fallback seguro ante JSON corrupto', () => {
    const store = new Map<string, string>()
    const driver: StorageDriver = {
        get: (key) => store.get(key) || null,
        set: (key, val) => store.set(key, val),
        remove: (key) => store.delete(key)
    }

    // Simulamos corrupción manual
    driver.set('statelink:corrupt', '{ basura: }')

    // No debe lanzar excepción, debe retornar initialState
    const loaded = load('corrupt', { count: 0 }, driver)
    
    expect(loaded.count).toBe(0)
    // Debe haber borrado la entrada corrupta
    expect(driver.get('statelink:corrupt')).toBeNull()
})

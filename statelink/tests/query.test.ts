import { expect, test } from 'vitest'
import { store, query } from '../src/index.ts'

test('Query API: Fetch básico y transiciones', async () => {
    let calls = 0;
    const postsQuery = query({
        key: 'posts',
        fetch: async () => {
            calls++;
            return ['post1', 'post2'];
        }
    });

    expect(postsQuery.status).toBe('loading');
    expect(postsQuery.isFetching).toBe(true);

    await new Promise(r => setTimeout(r, 10)); // simular latencia de red

    expect(postsQuery.status).toBe('success');
    expect(postsQuery.data).toEqual(['post1', 'post2']);
    expect(calls).toBe(1);
});

test('Query API: Refetch Automático al cambiar llaves (Magia reactiva)', async () => {
    let lastFetchedId = '';
    const userId = store({ id: '123' });

    const userQuery = query({
        key: () => `user-${userId.id}`, // Llave dinámica basada en otro store
        fetch: async () => {
            lastFetchedId = userId.id;
            return { name: 'Ana' };
        }
    });

    await new Promise(r => setTimeout(r, 10));
    expect(lastFetchedId).toBe('123'); // Primera carga

    // Al mutar la dependencia, el effect() interior se dispara y reejecuta el fetch
    userId.id = '456';
    
    await new Promise(r => setTimeout(r, 10)); // wait queueMicrotask
    await new Promise(r => setTimeout(r, 10)); // wait fetch completion

    expect(lastFetchedId).toBe('456');
});

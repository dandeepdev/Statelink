import { store } from '../index.js';
import { effect, globalGraph } from './signal-graph.js'; // Importamos globalGraph para apagar el tracking

export interface QueryOptions<T> {
    key: string | (() => string);
    fetch: () => Promise<T>;
    staleTime?: number;
    retry?: number;
    persist?: boolean;
}

export function query<T>(options: QueryOptions<T>) {
    const isDynamic = typeof options.key === 'function';
    const initialKey = isDynamic ? (options.key as Function)() : options.key as string;

    const queryState = store({
        status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
        data: null as T | null,
        error: null as Error | null,
        lastFetched: 0,
        isFetching: false
    }, { persist: options.persist, key: options.persist ? `query-${initialKey}` : undefined });

    const executeFetch = async (currentKey: string) => {
        if (queryState.isFetching) return;
        
        if (options.staleTime && queryState.status === 'success') {
            if (Date.now() - queryState.lastFetched < options.staleTime) {
                return;
            }
        }

        queryState.isFetching = true;
        if (queryState.status === 'idle' || queryState.status === 'error') {
            queryState.status = 'loading';
        }

        let attempts = 0;
        const maxRetries = options.retry ?? 0;

        while (attempts <= maxRetries) {
            try {
                const result = await options.fetch();
                
                const latestKey = isDynamic ? (options.key as Function)() : options.key;
                if (latestKey !== currentKey) return;

                queryState.data = result;
                queryState.status = 'success';
                queryState.error = null;
                queryState.lastFetched = Date.now();
                break;
            } catch (err) {
                attempts++;
                if (attempts > maxRetries) {
                    queryState.error = err instanceof Error ? err : new Error(String(err));
                    queryState.status = 'error';
                }
            }
        }
        queryState.isFetching = false;
    };

    if (isDynamic) {
        effect(() => {
            const currentKey = (options.key as Function)();
            
            // FIX: Apagar el tracking reactivo antes de lanzar efectos secundarios
            const prevEffect = globalGraph.getActiveEffect();
            globalGraph.setActiveEffect(null); 
            
            executeFetch(currentKey); // Fetch es invisible al grafo (No loops infinitos)
            
            globalGraph.setActiveEffect(prevEffect); // Restauramos para el siguiente effect
        });
    } else {
        executeFetch(options.key as string);
    }

    return queryState;
}

import { useState, useEffect } from 'react';

/**
 * El puente mágico entre Statelink y React.
 * Fuerza un re-renderizado solo cuando el proxy local de memoria detecta un cambio,
 * asegurando 60 FPS sin depender de asincronía.
 */
export function useStatelink<T extends { subscribe: (fn: () => void) => () => void }>(storeObject: T): T {
    const [, forceRender] = useState(0);
    
    useEffect(() => {
        // Nos suscribimos a las mutaciones de la base de datos local
        const unsubscribe = storeObject.subscribe(() => {
            forceRender(x => x + 1);
        });
        
        return unsubscribe; // Limpieza automática garantizada
    }, [storeObject]);
    
    return storeObject;
}

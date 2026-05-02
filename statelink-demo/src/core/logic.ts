import { configureStorelink } from 'statelink/web';
import { store, compute } from 'statelink';

// 1. Configuramos el adaptador Web (localStorage reactivo). 
// Para el equipo de Mobile, aquí inyectarían NativeAdapter usando MMKV.
configureStorelink();

// 2. La Verdad Central. Este archivo es idéntico para Web y Mobile.
export const writerState = store({
    draft: "",
    savedVerses: new Set<string>(), // Usamos un Set nativo, cero serializaciones
    lastEdited: new Date()          // Usamos un Date nativo
}, { 
    persist: true, 
    key: 'writer-forge-v2' 
});

// 3. El Análisis (Consecuencia directa del estado)
export const analytics = compute(() => {
    const draft = writerState.draft.trim();
    const words = draft.split(/\s+/).filter(w => w.length > 0);
    
    // Buscar claridad ontológica ("X es Y")
    const isMemorable = draft.includes(" es ") || draft.includes(" son ");
    
    return {
        wordCount: words.length,
        readingTimeSecs: Math.ceil(words.length * 0.3), // 3 palabras por segundo
        isMemorable
    };
});

import { configureStorelink } from 'statelink/web';
import { store, compute, query } from 'statelink';

// 1. Configuración Cero-Boilerplate (Activa LocalStorage)
configureStorelink();

// 2. Modelo de Datos con Colecciones Nativas
interface Task {
    id: string;
    text: string;
    completed: boolean;
    timestamp: Date;
}

const appState = store({
    theme: 'dark',
    tasks: new Map<string, Task>()
}, { persist: true, key: 'demo-app' });

// 3. Estado Derivado (Computeds Reactivos)
const stats = compute(() => {
    let completed = 0;
    appState.tasks.forEach(t => { if (t.completed) completed++; });
    return {
        total: appState.tasks.size,
        completed,
        pending: appState.tasks.size - completed
    };
});

// 4. Estado Asíncrono Integrado (Query refetch automático)
const serverSync = query({
    key: () => `sync-${appState.tasks.size}-${stats.value.completed}`, 
    fetch: async () => {
        // Simulamos sincronización en la nube (Offline-First Mirror Experience)
        await new Promise(r => setTimeout(r, 1000));
        return { syncedAt: new Date().toLocaleTimeString() };
    }
});

// --- UI RENDER (Vanilla JS Reactivo) ---
const render = () => {
    document.documentElement.setAttribute('data-theme', appState.theme);

    const appDiv = document.getElementById('app')!;
    
    // Status visual de la nube
    let statusClass = 'loading';
    let statusText = 'Sincronizando...';
    if (serverSync.status === 'success') {
        statusClass = 'success';
        statusText = `Sincronizado 100% Offline (Último: ${serverSync.data?.syncedAt})`;
    }

    appDiv.innerHTML = `
        <div class="container">
            <div class="header">
                <div>
                    <h1>Inventario Universal</h1>
                    <div class="network-status">
                        <div class="status-dot ${statusClass}"></div>
                        <span style="opacity: 0.8; font-size: 0.9rem">${statusText}</span>
                    </div>
                </div>
                <button id="theme-btn">${appState.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>
            </div>

            <div class="card stats">
                <div class="stat-box"><h3>${stats.value.total}</h3><p>Total</p></div>
                <div class="stat-box"><h3>${stats.value.completed}</h3><p>Completadas</p></div>
                <div class="stat-box"><h3>${stats.value.pending}</h3><p>Pendientes</p></div>
            </div>

            <div class="card">
                <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                    <input type="text" id="task-input" placeholder="Nueva tarea (ej. Comprar inventario)..." style="flex:1; padding: 12px; border-radius: 8px; border: 1px solid #ccc; background: transparent; color: inherit;">
                    <button id="add-btn">Añadir</button>
                </div>
                
                <ul class="task-list">
                    ${Array.from(appState.tasks.values()).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(task => `
                        <li class="task-item ${task.completed ? 'completed' : ''}">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" data-id="${task.id}" class="toggle-task" ${task.completed ? 'checked' : ''}>
                                <span>${task.text}</span>
                            </div>
                            <button data-id="${task.id}" class="delete-task" style="background: #ef4444">Borrar</button>
                        </li>
                    `).join('')}
                </ul>
                ${appState.tasks.size === 0 ? '<p style="text-align: center; opacity: 0.5">Empieza a escribir sin conexión. Todo se guardará.</p>' : ''}
            </div>
        </div>
    `;

    // Event Listeners (Zero Boilerplate Mutations)
    document.getElementById('theme-btn')?.addEventListener('click', () => {
        appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    });

    document.getElementById('add-btn')?.addEventListener('click', () => {
        const input = document.getElementById('task-input') as HTMLInputElement;
        if (input.value.trim()) {
            const id = Math.random().toString(36).substring(7);
            // Muta el Map de JS nativo y Statelink hace el resto
            appState.tasks.set(id, { id, text: input.value, completed: false, timestamp: new Date() });
        }
    });

    document.querySelectorAll('.toggle-task').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id')!;
            const task = appState.tasks.get(id);
            if (task) {
                task.completed = !task.completed; 
                appState.tasks.set(id, task);
            }
        });
    });

    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id')!;
            appState.tasks.delete(id);
        });
    });
};

// 5. Suscripción Universal
appState.subscribe(render);
serverSync.subscribe(render);
stats.value; // Tracking inicial

render();

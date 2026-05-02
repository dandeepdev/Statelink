import React, { useEffect } from 'react';
import { writerState, analytics } from './core/logic';
import { useStatelink } from './hooks/useStatelink';
import { BookOpen, Clock, Zap, Trash2, PenTool } from 'lucide-react';

export default function App() {
    // 1. El Puente: Conectamos la Reactividad Mágica a React
    useStatelink(writerState);
    
    // 2. Extraemos el estado (Zero-Boilerplate)
    const { draft, savedVerses, lastEdited } = writerState;
    
    // El compute() rastrea automáticamente todo acceso a `value`
    const { wordCount, readingTimeSecs, isMemorable } = analytics.value;

    const handleSaveVerse = () => {
        if (draft.trim() && !savedVerses.has(draft.trim())) {
            // Mutación Nativa: Modificamos el Set de JavaScript directamente
            writerState.savedVerses.add(draft.trim());
            writerState.draft = ""; 
            writerState.lastEdited = new Date();
        }
    };

    const handleDeleteVerse = (verse: string) => {
        // Mutación Nativa
        writerState.savedVerses.delete(verse);
        writerState.lastEdited = new Date();
    };

    return (
        <div className="layout">
            <main className="editor-zone">
                <header className="editor-header">
                    <div className="logo">
                        <PenTool size={24} />
                        <h2>The Forge</h2>
                    </div>
                    <span className="last-edited">
                        Last edited: {lastEdited.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                </header>
                
                <textarea 
                    className="canvas"
                    placeholder="Immortalize a thought here..."
                    value={draft}
                    onChange={(e) => {
                        writerState.draft = e.target.value;
                        writerState.lastEdited = new Date();
                    }}
                    autoFocus
                />

                <div className="analytics-bar">
                    <div className="metric">
                        <BookOpen size={16} className="metric-icon" />
                        <span className="value">{wordCount}</span>
                        <span className="label">words</span>
                    </div>
                    <div className="metric">
                        <Clock size={16} className="metric-icon" />
                        <span className="value">{readingTimeSecs}s</span>
                        <span className="label">read time</span>
                    </div>
                    
                    {isMemorable && (
                        <div className="badge pulse">
                            <Zap size={14} />
                            Memorable Verse Detected
                        </div>
                    )}

                    <button 
                        className="save-btn" 
                        onClick={handleSaveVerse}
                        disabled={!draft.trim()}
                    >
                        Forge Verse
                    </button>
                </div>
            </main>

            <aside className="gallery-zone">
                <div className="gallery-header">
                    <h3>Forged Verses</h3>
                    <span className="count">{savedVerses.size}</span>
                </div>
                
                <div className="verses-list">
                    {(() => {
                        try {
                            if (savedVerses.size === 0) {
                                return (
                                    <div className="empty-state">
                                        <p>Silence is your canvas.</p>
                                        <p>Write something on the left to begin.</p>
                                    </div>
                                );
                            }
                            
                            const arr = Array.from(savedVerses);
                            return arr.reverse().map((verse, idx) => (
                                <div key={idx} className="verse-card">
                                    <p>"{String(verse)}"</p>
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => handleDeleteVerse(String(verse))}
                                        title="Discard verse"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ));
                        } catch (err: any) {
                            return <div style={{color: 'red'}}>ERROR: {err.message || String(err)}</div>;
                        }
                    })()}
                </div>
            </aside>
        </div>
    );
}

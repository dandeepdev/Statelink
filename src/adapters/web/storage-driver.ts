export interface StorageDriver {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
}

export const localStorageDriver: StorageDriver = {
    get(key: string) {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(key);
    },
    set(key: string, value: string) {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(key, value);
    },
    remove(key: string) {
        if (typeof localStorage === 'undefined') return;
        localStorage.removeItem(key);
    }
};

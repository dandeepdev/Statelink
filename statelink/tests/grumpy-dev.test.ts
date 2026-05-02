import { expect, test } from 'vitest';
import { store, compute } from '../src/index.ts';
import { encodeState, decodeState } from '../src/index.ts';

test('Grumpy 1: Computed encadenados (Ceguera Reactiva resuelta)', () => {
    const s = store({ price: 100 });
    
    // Nivel 1
    const withTax = compute(() => s.price * 1.2);
    // Nivel 2
    const formatted = compute(() => `$${withTax.value}`);

    expect(formatted.value).toBe('$120');

    // Mutamos la base, la onda expansiva debe llegar hasta "formatted"
    s.price = 200;

    expect(formatted.value).toBe('$240');
});

test('Grumpy 8: Errores son serializables para fallos asíncronos', () => {
    const original = new Error('Falló la base de datos');
    original.name = 'TimeoutError';

    const encoded = encodeState({ serverError: original });
    const decoded = decodeState(encoded);

    expect(decoded.serverError).toBeInstanceOf(Error);
    expect(decoded.serverError.message).toBe('Falló la base de datos');
    expect(decoded.serverError.name).toBe('TimeoutError');
    // El stacktrace debe preservarse para poder debuggear tras un reload
    expect(decoded.serverError.stack).toBe(original.stack);
});

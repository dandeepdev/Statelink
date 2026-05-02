import { expect, test } from 'vitest'
import { encodeState, decodeState } from '../src/index.ts'

test('Codecs: ida y vuelta perfecta', () => {
  const original = { date: new Date('2024-01-01'), tags: new Set(['a', 'b']) }
  const encoded = encodeState(original)
  
  expect(encoded.date.__t).toBe('Date')
  expect(encoded.tags.__t).toBe('Set')
  
  const decoded = decodeState(encoded)
  
  expect(decoded.date instanceof Date).toBe(true)
  expect(decoded.tags instanceof Set).toBe(true)
  expect(decoded.tags.has('a')).toBe(true)
})

test('Codec falla claro en desarrollo para clases desconocidas', () => {
  class MiClase {}
  expect(() => encodeState({ obj: new MiClase() })).toThrowError(/MiClase/)
})

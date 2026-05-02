import { expect, test } from 'vitest'
import { store } from '../src/index.ts'

test('Reactividad básica funciona', async () => {
  const s = store({ count: 0 })
  let value = 0
  s.subscribe((state: any) => { value = state.count })
  s.count++
  
  // Esperar a que pase el queueMicrotask
  await Promise.resolve()
  expect(value).toBe(1)
})

test('Identidad de proxy anidado (WeakMap cache)', () => {
  const s = store({ user: { name: 'Ana' } })
  // Referencia estable (true === true)
  expect(s.user).toBe(s.user)
})

test('Objetos anidados funcionan (Lazy Deep Proxies)', async () => {
  const s = store({ user: { address: { city: 'Pasto' } } })
  let lastCity = ''
  s.subscribe((state: any) => { lastCity = state.user.address.city })
  s.user.address.city = 'Bogotá'
  
  await Promise.resolve()
  expect(lastCity).toBe('Bogotá')
})

test('Batching funciona (queueMicrotask)', async () => {
  const s = store({ a: 0, b: 0 })
  let notifications = 0
  s.subscribe(() => notifications++)
  s.a = 1
  s.b = 1
  
  await Promise.resolve()
  // Debería ser 1, no 2, gracias al batching
  expect(notifications).toBe(1)
})

test('Wrappers para colecciones (Set)', async () => {
  const s = store({ history: new Set(['init']) })
  let size = 0
  s.subscribe((state: any) => { size = state.history.size })
  
  // Mutar la colección debe disparar notificaciones
  s.history.add('login')
  
  await Promise.resolve()
  expect(size).toBe(2)
})

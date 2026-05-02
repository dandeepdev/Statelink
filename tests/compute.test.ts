import { expect, test } from 'vitest'
import { store, compute } from '../src/index.ts'

test('Computed es lazy y no recalcula de más', () => {
  let recalculations = 0
  const s = store({ a: 1, b: 2 })
  
  const sum = compute(() => { 
    recalculations++; 
    return s.a + s.b 
  })

  expect(recalculations).toBe(0) // Aún no se ha evaluado (lazy)

  expect(sum.value).toBe(3)
  expect(recalculations).toBe(1)
  
  expect(sum.value).toBe(3)
  expect(recalculations).toBe(1) // No recalculó, usó caché
  
  s.a = 10
  expect(sum.value).toBe(12)
  expect(recalculations).toBe(2) // Recalculó por cambio de dependencia
})

test('Computed maneja objetos anidados', () => {
  const app = store({ user: { score: 50 } })
  
  const isWinner = compute(() => app.user.score >= 100)
  
  expect(isWinner.value).toBe(false)
  
  app.user.score = 150
  expect(isWinner.value).toBe(true)
})

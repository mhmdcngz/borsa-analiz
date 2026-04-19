import { describe, it, expect } from 'vitest'
import { STOCK_LIST } from '../data/stocks'

describe('Borsa Veri Testleri', () => {
  it('STOCK_LIST boş olmamalıdır', () => {
    expect(STOCK_LIST.length).toBeGreaterThan(0)
  })

  it('Popüler endeksler listede olmalıdır', () => {
    const symbols = STOCK_LIST.map(s => s.symbol)
    expect(symbols).toContain('XU100.IS')
    expect(symbols).toContain('XU030.IS')
    expect(symbols).toContain('TRY=X') // Dolar/TL
  })

  it('Hisse objeleri doğru formatta olmalıdır', () => {
    const firstStock = STOCK_LIST[0]
    expect(firstStock).toHaveProperty('symbol')
    expect(firstStock).toHaveProperty('code')
    expect(firstStock).toHaveProperty('name')
  })
})

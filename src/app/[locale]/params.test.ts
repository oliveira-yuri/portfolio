import { describe, expect, it } from 'vitest'
import { dynamicParams, generateStaticParams } from './layout'

describe('parâmetros estáticos da rota de locale', () => {
  it('gera exatamente pt e en', async () => {
    expect(await generateStaticParams()).toEqual([{ locale: 'pt' }, { locale: 'en' }])
  })

  it('não aceita parâmetros dinâmicos fora dessa lista', () => {
    expect(dynamicParams).toBe(false)
  })
})

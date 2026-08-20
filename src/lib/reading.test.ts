import { describe, expect, it } from 'vitest'
import { tempoDeLeitura } from '@/lib/reading'

describe('tempoDeLeitura', () => {
  it('estima 200 palavras por minuto, arredondando para cima', () => {
    expect(tempoDeLeitura('palavra '.repeat(400))).toBe(2)
    expect(tempoDeLeitura('palavra '.repeat(401))).toBe(3)
  })

  it('nunca devolve menos de um minuto', () => {
    expect(tempoDeLeitura('duas palavras')).toBe(1)
    expect(tempoDeLeitura('')).toBe(1)
  })

  it('ignora bloco de código na contagem, porque não se lê código como texto', () => {
    const comCodigo = `Texto curto.\n\n\`\`\`ts\n${'const x = 1\n'.repeat(300)}\`\`\``

    expect(tempoDeLeitura(comCodigo)).toBe(1)
  })
})

const PALAVRAS_POR_MINUTO = 200

/** Minutos de leitura do corpo MDX. Bloco de código não conta. */
export function tempoDeLeitura(corpo: string): number {
  const semCodigo = corpo.replace(/```[\s\S]*?```/g, ' ')
  const palavras = semCodigo.split(/\s+/).filter((palavra) => palavra !== '').length
  return Math.max(1, Math.ceil(palavras / PALAVRAS_POR_MINUTO))
}

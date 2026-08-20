/**
 * `next/font/google` só funciona dentro do pipeline de build do Next
 * (a chamada é substituída em tempo de build por um plugin SWC/webpack).
 * Fora dele — como no Vitest, que roda sobre Vite — a chamada real tentaria
 * buscar metadados de fonte pela rede. Este stub substitui o módulo nos
 * testes por algo com o mesmo formato de retorno.
 */
function mockFontLoader() {
  return { className: 'mock-font-className', variable: 'mock-font-variable' }
}

export const Newsreader = mockFontLoader
export const IBM_Plex_Mono = mockFontLoader

import Link from 'next/link'
import '../app/globals.css'

// Este projeto não tem app/layout.tsx: o layout "raiz" de fato é
// app/[locale]/layout.tsx, um segmento dinâmico (locale). Para uma URL que
// não bate com nenhuma rota (ex.: /es, /qualquer-coisa), o Next não sabe
// qual locale usar e não passa por aquele layout — então este arquivo
// precisa emitir o documento <html>/<body> completo, e não só um
// fragmento a ser encaixado num layout existente.
//
// Ao construir o build acima, o próprio Next envolve esta página num shell
// padrão dele (com o <head> dele já enviado antes desta árvore renderizar),
// por isso um <title> aqui — testado tanto dentro de um <head> próprio
// quanto solto, como o `global-not-found` interno do Next faz — nunca chega
// a aparecer no HTML final: não há como definir o <title> desta página sem
// migrar para app/global-not-found.tsx (convenção experimental, fora do
// escopo pedido aqui). O essencial (lang, corpo, status 404 e link de volta)
// funciona; ausência de <title> aqui é uma limitação conhecida, não um bug.
export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body className="bg-papel text-tinta">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
          <p className="font-dado text-xs tracking-widest text-suave uppercase">404</p>
          <h1 className="mt-4 font-display text-4xl text-tinta md:text-5xl">Página não encontrada</h1>
          <p className="mt-5 max-w-prose text-lg text-suave">
            Esta página não existe ou foi movida. Volte para o início.
          </p>
          <p className="mt-8">
            <Link
              href="/pt"
              className="border-b border-fio pb-0.5 transition-colors hover:border-frio hover:text-frio"
            >
              Voltar para o início
            </Link>
          </p>
        </div>
      </body>
    </html>
  )
}

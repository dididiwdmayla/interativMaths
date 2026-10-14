/** Os quatro cantos: entrar em tela cheia (para fora) ou sair (para dentro). */
export function IconeTelaCheia({ sair = false, tamanho = 18 }: { sair?: boolean; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {sair ? <path d="M6.5 2.5v4h-4M15.5 6.5h-4v-4M11.5 15.5v-4h4M2.5 11.5h4v4" /> : <path d="M2.5 6.5v-4h4M11.5 2.5h4v4M15.5 11.5v4h-4M6.5 15.5h-4v-4" />}
    </svg>
  );
}

/** Uma página do Manual: inteira, com linhas; rasgada, com a borda de baixo em dentes. */
export function IconePagina({ rasgada = false, tamanho = 26 }: { rasgada?: boolean; tamanho?: number }) {
  return (
    <svg viewBox="0 0 26 30" width={tamanho} height={(tamanho * 30) / 26} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true" className="flex-none">
      {rasgada ? (
        <>
          <path d="M3 2h14l6 6v10l-4 3-4-3-4 3-4-3-4 3Z" />
          <path d="M7 13h12" />
        </>
      ) : (
        <>
          <path d="M3 2h14l6 6v20H3Z" />
          <path d="M7 13h12M7 18h12M7 23h8" />
        </>
      )}
    </svg>
  );
}

/** Ainda a lápis: o conceito não tem missão nesta versão. */
export function IconePaginaLapis({ tamanho = 26 }: { tamanho?: number }) {
  return (
    <svg viewBox="0 0 26 30" width={tamanho} height={(tamanho * 30) / 26} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
      <path d="M5 25 7 19 19 7a2.1 2.1 0 0 1 3 3L10 22Z" />
      <path d="M17 9l3 3" />
    </svg>
  );
}

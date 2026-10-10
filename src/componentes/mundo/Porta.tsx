"use client";

/**
 * A porta de entrada: decide para onde ir na primeira pintura depois de ler o progresso.
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Carregando } from "@/componentes/ui/Carregando";

export function Porta() {
  const { pronto, progresso } = useProgresso();
  const router = useRouter();
  const destino = !pronto ? null : !progresso.aberturaVista ? "/abertura" : progresso.calibragem === null ? "/calibragem" : "/mapa";
  useEffect(() => {
    if (destino) router.replace(destino);
  }, [destino, router]);
  return <Carregando />;
}

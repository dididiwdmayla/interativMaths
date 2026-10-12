import type { Metadata } from "next";
import { Degustacao } from "@/componentes/degustacao/Degustacao";
import { compartilhamento } from "../metadados";

const TITULO = "Degustação: três broas, quatro mesas";
const DESCRICAO = "Cinco minutos no Engenho: reparta três broas entre quatro mesas e descubra por que o traço da fração é uma divisão.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  ...compartilhamento("/degustacao", `${TITULO} · interativMaths`, DESCRICAO),
};

export default function PaginaDegustacao() {
  return <Degustacao />;
}

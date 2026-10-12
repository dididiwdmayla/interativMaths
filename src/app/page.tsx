import type { Metadata } from "next";
import { Porta } from "@/componentes/mundo/Porta";
import { compartilhamento, DESCRICAO } from "./metadados";

export const metadata: Metadata = compartilhamento("/", "interativMaths — o Engenho", DESCRICAO);

export default function Inicio() {
  return <Porta />;
}

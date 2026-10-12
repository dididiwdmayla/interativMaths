import type { Metadata } from "next";
import { Degustacao } from "@/componentes/degustacao/Degustacao";

export const metadata: Metadata = {
  title: "Degustação: três broas, quatro mesas",
  description: "Cinco minutos no Engenho: reparta três broas entre quatro mesas e descubra por que o traço da fração é uma divisão.",
};

export default function PaginaDegustacao() {
  return <Degustacao />;
}

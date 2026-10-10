import type { Metadata } from "next";
import { Distrito } from "@/componentes/mundo/Distrito";

export const metadata: Metadata = { title: "A Partilha" };

export default function PaginaPartilha() {
  return <Distrito />;
}

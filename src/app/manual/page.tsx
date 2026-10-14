import type { Metadata } from "next";
import { Manual } from "@/componentes/manual/Manual";

export const metadata: Metadata = { title: "Manual" };

export default function PaginaManual() {
  return <Manual />;
}

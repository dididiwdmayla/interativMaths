import type { Metadata } from "next";
import { Calibragem } from "@/componentes/mundo/Calibragem";

export const metadata: Metadata = { title: "Calibragem" };

export default function PaginaCalibragem() {
  return <Calibragem />;
}

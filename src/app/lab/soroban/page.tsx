import type { Metadata } from "next";
import { LabSoroban } from "@/componentes/lab/LabSoroban";

export const metadata: Metadata = { title: "Soroban" };

export default function PaginaLabSoroban() {
  return <LabSoroban />;
}

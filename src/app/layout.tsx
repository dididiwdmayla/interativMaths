import type { Metadata, Viewport } from "next";
import { AplicarPreferencias } from "@/componentes/estado/Preferencias";
import { AvisoProgresso } from "@/componentes/estado/AvisoProgresso";
import { AplicarTema } from "@/componentes/ui/Tema";
import { SCRIPT_TEMA } from "@/componentes/ui/tema";
import { lerToken } from "@/tema/lerToken";
import { fonteInterface, fonteMao } from "./fontes";
import { DESCRICAO, ENDERECO_OFICIAL, NOME } from "./metadados";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(ENDERECO_OFICIAL),
  title: {
    default: "interativMaths — o Engenho",
    template: "%s · interativMaths",
  },
  description: DESCRICAO,
  applicationName: NOME,
  openGraph: { type: "website", locale: "pt_BR", siteName: NOME, title: "interativMaths — o Engenho", description: DESCRICAO },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // A barra do navegador na cor do papel; o tema escolhido no jogo acerta a cor depois (Tema.tsx).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: lerToken("papel") },
    { media: "(prefers-color-scheme: dark)", color: lerToken("papel", "escuro") },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // O script do <head> põe data-tema antes da primeira pintura; o React aceita o que ele pôs.
    <html lang="pt-BR" className={`${fonteInterface.variable} ${fonteMao.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <AplicarPreferencias />
        <AplicarTema />
        <AvisoProgresso />
        {children}
      </body>
    </html>
  );
}

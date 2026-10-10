/**
 * POST /api/tutor — tutor por conversa, preparado e desligado.
 * Sem a variável de ambiente TUTOR_CHAVE_API (lida só no servidor; nunca NEXT_PUBLIC_), responde
 * que a conversa não está disponível. Nenhum SDK de provedor é instalado nesta versão.
 */
import { ehPedidoTutor, type RespostaTutor } from "@/nucleo/tutor/contrato";

export async function POST(pedido: Request): Promise<Response> {
  let corpo: unknown;
  try {
    corpo = await pedido.json();
  } catch {
    return Response.json({ erro: "corpo inválido" }, { status: 400 });
  }
  if (!ehPedidoTutor(corpo)) return Response.json({ erro: "pedido fora do contrato" }, { status: 400 });

  const chave = process.env.TUTOR_CHAVE_API;
  if (!chave) {
    const resposta: RespostaTutor = { disponivel: false, motivo: "O tutor por conversa não está disponível nesta versão. O Nônio responde pela escada de medidas." };
    return Response.json(resposta);
  }
  // Com a chave configurada, a integração ainda precisa ser construída (próxima versão).
  const resposta: RespostaTutor = { disponivel: false, motivo: "A integração do tutor por conversa ainda não foi construída." };
  return Response.json(resposta);
}

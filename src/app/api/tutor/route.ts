/**
 * POST /api/tutor: Pergunte ao Nônio. Só servidor: a chave (ANTHROPIC_API_KEY) nunca chega ao
 * navegador. Sem a chave, a conversa responde que não está disponível e o jogo segue igual.
 * O trabalho mora em src/servidor/tutor; aqui ficam só as opções da rota.
 *
 * Roda em Node.js, o padrão do Next 16. A opção `runtime` não é exportada: com Cache Components
 * ligado, o Next 16.4 recusa a rota que a declara (a documentação manda removê-la).
 */
import { dependenciasPadrao, tratarPedidoTutor } from "@/servidor/tutor/tratar";

export const maxDuration = 60;

export async function POST(pedido: Request): Promise<Response> {
  return tratarPedidoTutor(pedido, dependenciasPadrao());
}

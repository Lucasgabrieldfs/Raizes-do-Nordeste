import { prisma } from './prismaClient.js';

export async function logAudit({ usuarioId = null, acao, recurso, payloadResumido = null, enderecoIp = '127.0.0.1' }) {
  try {
    return await prisma.logAuditoria.create({
      data: {
        usuarioId,
        acao,
        recurso,
        payloadResumido: payloadResumido ? (typeof payloadResumido === 'object' ? JSON.stringify(payloadResumido).substring(0, 500) : String(payloadResumido).substring(0, 500)) : null,
        enderecoIp
      }
    });
  } catch (error) {
    console.error('Falha ao gravar log de auditoria:', error);
  }
}

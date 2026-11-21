import { z } from 'zod';
import { prisma } from '../../infrastructure/prismaClient.js';
import { logAudit } from '../../infrastructure/auditLogger.js';

export const consentFidelidadeSchema = z.object({
  consentimentoLGPD: z.boolean(),
  cpf: z.string().optional()
});

export class FidelidadeController {
  static async getBalance(req, res, next) {
    try {
      const usuarioId = req.user.id;

      const fidelidade = await prisma.fidelidadePontos.findUnique({
        where: { usuarioId }
      });

      if (!fidelidade) {
        return res.status(200).json({
          saldoPontos: 0,
          consentimentoLGPD: false,
          mensagem: 'Usuário ainda não aderiu ao programa de fidelidade.'
        });
      }

      return res.status(200).json({
        usuarioId: fidelidade.usuarioId,
        cpfMascarado: fidelidade.cpf ? fidelidade.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4') : null,
        saldoPontos: fidelidade.saldoPontos,
        consentimentoLGPD: fidelidade.consentimentoLGPD,
        atualizadoEm: fidelidade.atualizadoEm
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateConsent(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const { consentimentoLGPD, cpf } = req.body;

      const fidelidade = await prisma.fidelidadePontos.upsert({
        where: { usuarioId },
        update: {
          consentimentoLGPD,
          cpf: cpf || undefined
        },
        create: {
          usuarioId,
          cpf,
          saldoPontos: 0,
          consentimentoLGPD
        }
      });

      await logAudit({
        usuarioId,
        acao: 'CONSENTIMENTO_LGPD_ATUALIZADO',
        recurso: '/fidelidade/consentimento',
        payloadResumido: { consentimentoLGPD },
        enderecoIp: req.ip
      });

      return res.status(200).json({
        message: 'Consentimento de fidelidade atualizado com sucesso.',
        consentimentoLGPD: fidelidade.consentimentoLGPD,
        saldoPontos: fidelidade.saldoPontos
      });
    } catch (err) {
      next(err);
    }
  }
}

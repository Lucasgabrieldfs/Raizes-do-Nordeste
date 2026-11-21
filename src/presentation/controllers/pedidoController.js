import { z } from 'zod';
import { prisma } from '../../infrastructure/prismaClient.js';
import { CanalPedidoEnum, StatusPedidoEnum } from '../../domain/enums.js';
import { MockPaymentService } from '../../infrastructure/mockPaymentService.js';
import { logAudit } from '../../infrastructure/auditLogger.js';

export const createPedidoSchema = z.object({
  unidadeId: z.number().int().positive('ID da unidade é obrigatório'),
  canalPedido: z.enum(['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'], {
    errorMap: () => ({ message: 'canalPedido é obrigatório e deve ser: APP, TOTEM, BALCAO, PICKUP ou WEB' })
  }),
  itens: z.array(z.object({
    produtoId: z.number().int().positive('ID do produto inválido'),
    quantidade: z.number().int().positive('Quantidade deve ser no mínimo 1')
  })).min(1, 'O pedido deve conter no mínimo 1 item'),
  observacoes: z.string().optional(),
  formaPagamento: z.string().optional()
});

export const processPaymentSchema = z.object({
  formaPagamento: z.enum(['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO']).default('PIX'),
  statusSimulado: z.enum(['APROVADO', 'RECUSADO', 'TIMEOUT']).default('APROVADO'),
  valor: z.number().positive().optional()
});

export const updateStatusSchema = z.object({
  novoStatus: z.enum(['AGUARDANDO_PAGAMENTO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'])
});

export class PedidoController {
  /**
   * [POST /pedidos] - Criação de Pedido com Validação Atômica de Multicanalidade e Estoque
   */
  static async create(req, res, next) {
    try {
      const { unidadeId, canalPedido, itens, observacoes } = req.body;
      const usuarioId = req.user ? req.user.id : null;

      // 1. Verificar se a unidade existe e está ativa
      const unidade = await prisma.unidade.findUnique({
        where: { id: unidadeId, ativo: true }
      });

      if (!unidade) {
        const error = new Error(`Unidade com ID ${unidadeId} não encontrada ou inativa.`);
        error.statusCode = 404;
        error.code = 'UNIDADE_NAO_ENCONTRADA';
        return next(error);
      }

      // 2. Validar existência dos produtos e disponibilidade de estoque na unidade
      const itensDetalhados = [];
      let totalCalculado = 0;

      for (let i = 0; i < itens.length; i++) {
        const { produtoId, quantidade } = itens[i];

        const produto = await prisma.produto.findUnique({
          where: { id: produtoId, ativo: true }
        });

        if (!produto) {
          const error = new Error(`Produto com ID ${produtoId} não encontrado.`);
          error.statusCode = 404;
          error.code = 'PRODUTO_NAO_ENCONTRADO';
          return next(error);
        }

        // Consultar saldo de estoque na unidade física
        const estoque = await prisma.estoqueUnidade.findUnique({
          where: {
            unidadeId_produtoId: {
              unidadeId,
              produtoId
            }
          }
        });

        const saldoDisponivel = estoque ? estoque.quantidadeDisponivel : 0;

        if (saldoDisponivel < quantidade) {
          const error = new Error('Não há quantidade suficiente para um ou mais itens.');
          error.statusCode = 409; // Conflict
          error.code = 'ESTOQUE_INSUFICIENTE';
          error.details = [
            {
              field: `itens[${i}].quantidade`,
              issue: `Produto '${produto.nome}' possui apenas ${saldoDisponivel} unidade(s) disponível(is) na unidade selecionada.`
            }
          ];
          return next(error);
        }

        const subtotal = produto.preco * quantidade;
        totalCalculado += subtotal;

        itensDetalhados.push({
          produtoId,
          nome: produto.nome,
          quantidade,
          precoUnitario: produto.preco,
          subtotal
        });
      }

      // 3. Execução Transacional ACID: Criar Pedido e Deduzir Estoque
      const novoPedido = await prisma.$transaction(async (tx) => {
        // Criar o pedido
        const pedidoCriado = await tx.pedido.create({
          data: {
            unidadeId,
            usuarioId,
            canalPedido,
            status: 'AGUARDANDO_PAGAMENTO',
            valorTotal: Math.round(totalCalculado * 100) / 100,
            observacoes,
            itens: {
              create: itensDetalhados.map(i => ({
                produtoId: i.produtoId,
                quantidade: i.quantidade,
                precoUnitario: i.precoUnitario,
                subtotal: i.subtotal
              }))
            }
          },
          include: {
            itens: true,
            unidade: { select: { id: true, nome: true } }
          }
        });

        // Deduzir o saldo físico de estoque da filial
        for (const item of itens) {
          await tx.estoqueUnidade.update({
            where: {
              unidadeId_produtoId: {
                unidadeId,
                produtoId: item.produtoId
              }
            },
            data: {
              quantidadeDisponivel: { decrement: item.quantidade }
            }
          });
        }

        return pedidoCriado;
      });

      // Gravar Log de Auditoria
      await logAudit({
        usuarioId,
        acao: 'PEDIDO_CRIADO',
        recurso: `/pedidos/${novoPedido.id}`,
        payloadResumido: {
          pedidoId: novoPedido.id,
          canal: canalPedido,
          total: novoPedido.valorTotal,
          itensCount: itens.length
        },
        enderecoIp: req.ip
      });

      return res.status(201).json({
        pedidoId: novoPedido.id,
        canalPedido: novoPedido.canalPedido,
        status: novoPedido.status,
        total: novoPedido.valorTotal,
        unidade: novoPedido.unidade,
        itens: novoPedido.itens,
        observacoes: novoPedido.observacoes,
        createdAt: novoPedido.criadoEm
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * [GET /pedidos] - Listagem de Pedidos com Filtro por canalPedido e Paginação
   */
  static async list(req, res, next) {
    try {
      const { canalPedido, status, page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {};
      if (canalPedido) where.canalPedido = String(canalPedido).toUpperCase();
      if (status) where.status = String(status).toUpperCase();

      const [total, pedidos] = await Promise.all([
        prisma.pedido.count({ where }),
        prisma.pedido.findMany({
          where,
          skip,
          take,
          orderBy: { criadoEm: 'desc' },
          include: {
            itens: {
              include: { produto: { select: { nome: true, categoria: true } } }
            },
            unidade: { select: { id: true, nome: true } },
            pagamentos: true
          }
        })
      ]);

      return res.status(200).json({
        data: pedidos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * [GET /pedidos/{id}] - Detalhes do Pedido
   */
  static async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);

      const pedido = await prisma.pedido.findUnique({
        where: { id },
        include: {
          itens: {
            include: { produto: true }
          },
          unidade: true,
          pagamentos: true,
          usuario: { select: { id: true, nome: true, email: true } }
        }
      });

      if (!pedido) {
        const error = new Error(`Pedido com ID ${id} não encontrado.`);
        error.statusCode = 404;
        error.code = 'PEDIDO_NAO_ENCONTRADO';
        return next(error);
      }

      return res.status(200).json(pedido);
    } catch (err) {
      next(err);
    }
  }

  /**
   * [POST /pedidos/{id}/pagamento] - Simulação de Pagamento Mock (Fluxo A)
   */
  static async processPayment(req, res, next) {
    try {
      const pedidoId = parseInt(req.params.id);
      const { formaPagamento, statusSimulado } = req.body;

      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId }
      });

      if (!pedido) {
        const error = new Error(`Pedido com ID ${pedidoId} não encontrado.`);
        error.statusCode = 404;
        error.code = 'PEDIDO_NAO_ENCONTRADO';
        return next(error);
      }

      if (pedido.status !== 'AGUARDANDO_PAGAMENTO') {
        const error = new Error(`Este pedido não está aguardando pagamento. Status atual: ${pedido.status}`);
        error.statusCode = 409;
        error.code = 'STATUS_INVALIDO_PAGAMENTO';
        return next(error);
      }

      // Invocar serviço Mock de Pagamento Desacoplado
      const resultadoMock = await MockPaymentService.processPayment({
        pedidoId,
        valor: pedido.valorTotal,
        formaPagamento,
        statusSimulado
      });

      if (!resultadoMock.sucesso) {
        // Registrar tentativa com recusa
        await prisma.transacaoPagamento.create({
          data: {
            pedidoId,
            formaPagamento,
            statusTransacao: 'RECUSADO',
            valorPago: pedido.valorTotal,
            protocoloMock: resultadoMock.protocoloMock
          }
        });

        await logAudit({
          usuarioId: req.user ? req.user.id : pedido.usuarioId,
          acao: 'PAGAMENTO_RECUSADO',
          recurso: `/pedidos/${pedidoId}/pagamento`,
          payloadResumido: { motivo: resultadoMock.motivo },
          enderecoIp: req.ip
        });

        const error = new Error(resultadoMock.motivo);
        error.statusCode = 400;
        error.code = 'PAGAMENTO_RECUSADO';
        return next(error);
      }

      // Pagamento APROVADO: transicionar status para EM_PREPARO (Cozinha)
      await prisma.$transaction(async (tx) => {
        await tx.transacaoPagamento.create({
          data: {
            pedidoId,
            formaPagamento,
            statusTransacao: 'APROVADO',
            valorPago: pedido.valorTotal,
            protocoloMock: resultadoMock.protocoloMock
          }
        });

        await tx.pedido.update({
          where: { id: pedidoId },
          data: { status: 'EM_PREPARO' }
        });

        // Bonificação do Programa de Fidelidade (1 ponto a cada R$ 10,00) com consentimento LGPD
        if (pedido.usuarioId) {
          const fidelidade = await tx.fidelidadePontos.findUnique({
            where: { usuarioId: pedido.usuarioId }
          });

          if (fidelidade && fidelidade.consentimentoLGPD) {
            const pontosGanhos = Math.floor(pedido.valorTotal / 10);
            if (pontosGanhos > 0) {
              await tx.fidelidadePontos.update({
                where: { usuarioId: pedido.usuarioId },
                data: { saldoPontos: { increment: pontosGanhos } }
              });
            }
          }
        }
      });

      await logAudit({
        usuarioId: req.user ? req.user.id : pedido.usuarioId,
        acao: 'PAGAMENTO_APROVADO',
        recurso: `/pedidos/${pedidoId}/pagamento`,
        payloadResumido: {
          protocolo: resultadoMock.protocoloMock,
          novoStatus: 'EM_PREPARO'
        },
        enderecoIp: req.ip
      });

      return res.status(200).json({
        transacaoId: resultadoMock.protocoloMock,
        pedidoId,
        statusPagamento: 'SUCESSO',
        novoStatusPedido: 'EM_PREPARO',
        valorPago: pedido.valorTotal,
        formaPagamento,
        pontosFidelidadeCreditados: Math.floor(pedido.valorTotal / 10),
        dataHora: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * [PATCH /pedidos/{id}/status] - Gestão da Esteira da Cozinha (KDS)
   * Restrito a perfis: COZINHA, ATENDENTE, ADMIN
   */
  static async updateStatus(req, res, next) {
    try {
      const pedidoId = parseInt(req.params.id);
      const { novoStatus } = req.body;

      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId }
      });

      if (!pedido) {
        const error = new Error(`Pedido com ID ${pedidoId} não encontrado.`);
        error.statusCode = 404;
        error.code = 'PEDIDO_NAO_ENCONTRADO';
        return next(error);
      }

      // Regra de transição de status (RN07)
      const transicoesValidas = {
        AGUARDANDO_PAGAMENTO: ['EM_PREPARO', 'CANCELADO'],
        EM_PREPARO: ['PRONTO', 'CANCELADO'],
        PRONTO: ['ENTREGUE'],
        ENTREGUE: [],
        CANCELADO: []
      };

      const permitidos = transicoesValidas[pedido.status] || [];
      if (!permitidos.includes(novoStatus)) {
        const error = new Error(`Transição de status inválida de '${pedido.status}' para '${novoStatus}'.`);
        error.statusCode = 409;
        error.code = 'TRANSICAO_STATUS_INVALIDA';
        error.details = [{ field: 'novoStatus', issue: `Transições válidas para este status: ${permitidos.join(', ') || 'nenhuma'}` }];
        return next(error);
      }

      const pedidoAtualizado = await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: novoStatus }
      });

      await logAudit({
        usuarioId: req.user ? req.user.id : null,
        acao: 'STATUS_ALTERADO',
        recurso: `/pedidos/${pedidoId}/status`,
        payloadResumido: {
          de: pedido.status,
          para: novoStatus,
          alteradoPor: req.user?.nome || 'Sistema'
        },
        enderecoIp: req.ip
      });

      return res.status(200).json({
        pedidoId: pedidoAtualizado.id,
        statusAnterior: pedido.status,
        statusAtual: pedidoAtualizado.status,
        atualizadoPor: req.user?.nome || 'Sistema',
        atualizadoEm: pedidoAtualizado.atualizadoEm
      });
    } catch (err) {
      next(err);
    }
  }
}

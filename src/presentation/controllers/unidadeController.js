import { prisma } from '../../infrastructure/prismaClient.js';

export class UnidadeController {
  static async list(req, res, next) {
    try {
      const unidades = await prisma.unidade.findMany({
        where: { ativo: true },
        select: {
          id: true,
          nome: true,
          endereco: true,
          cidade: true,
          estado: true,
          telefone: true
        }
      });
      return res.status(200).json(unidades);
    } catch (err) {
      next(err);
    }
  }

  static async getMenuByUnidade(req, res, next) {
    try {
      const unidadeId = parseInt(req.params.id);

      const unidade = await prisma.unidade.findUnique({
        where: { id: unidadeId }
      });

      if (!unidade) {
        const error = new Error(`Unidade com ID ${unidadeId} não encontrada.`);
        error.statusCode = 404;
        error.code = 'UNIDADE_NAO_ENCONTRADA';
        return next(error);
      }

      // Buscar produtos com estoque específico daquela unidade
      const produtos = await prisma.produto.findMany({
        where: { ativo: true },
        include: {
          estoques: {
            where: { unidadeId }
          }
        }
      });

      const menuFormatado = produtos.map(p => {
        const estoque = p.estoques[0];
        const saldo = estoque ? estoque.quantidadeDisponivel : 0;
        return {
          id: p.id,
          nome: p.nome,
          descricao: p.descricao,
          categoria: p.categoria,
          preco: p.preco,
          imagem: p.imagem,
          unidadeId,
          quantidadeDisponivel: saldo,
          disponivel: saldo > 0
        };
      });

      return res.status(200).json({
        unidade: {
          id: unidade.id,
          nome: unidade.nome,
          cidade: unidade.cidade,
          estado: unidade.estado
        },
        cardapio: menuFormatado
      });
    } catch (err) {
      next(err);
    }
  }
}

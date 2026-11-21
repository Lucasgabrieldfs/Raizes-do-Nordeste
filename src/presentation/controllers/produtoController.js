import { z } from 'zod';
import { prisma } from '../../infrastructure/prismaClient.js';

export const createProductSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  descricao: z.string().min(5, 'Descrição deve ser detalhada'),
  categoria: z.enum(['CUSCUZ', 'TAPIOCAS', 'PRATOS', 'BEBIDAS', 'SOBREMESAS']),
  preco: z.number().positive('Preço deve ser positivo'),
  imagem: z.string().url('URL de imagem inválida').optional()
});

export class ProdutoController {
  static async list(req, res, next) {
    try {
      const { categoria } = req.query;
      const where = { ativo: true };
      if (categoria) where.categoria = String(categoria).toUpperCase();

      const produtos = await prisma.produto.findMany({
        where,
        orderBy: { id: 'asc' }
      });

      return res.status(200).json(produtos);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const produto = await prisma.produto.findUnique({
        where: { id },
        include: {
          estoques: {
            include: { unidade: true }
          }
        }
      });

      if (!produto) {
        const error = new Error(`Produto com ID ${id} não encontrado.`);
        error.statusCode = 404;
        error.code = 'PRODUTO_NAO_ENCONTRADO';
        return next(error);
      }

      return res.status(200).json(produto);
    } catch (err) {
      next(err);
    }
  }
}

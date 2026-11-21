import { prisma } from '../../infrastructure/prismaClient.js';

export class AuditoriaController {
  static async list(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [total, logs] = await Promise.all([
        prisma.logAuditoria.count(),
        prisma.logAuditoria.findMany({
          skip,
          take,
          orderBy: { dataHora: 'desc' },
          include: {
            usuario: {
              select: { id: true, nome: true, email: true, perfil: true }
            }
          }
        })
      ]);

      return res.status(200).json({
        data: logs,
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
}

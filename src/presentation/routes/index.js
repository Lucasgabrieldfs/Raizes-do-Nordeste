import { Router } from 'express';
import authRoutes from './authRoutes.js';
import unidadeRoutes from './unidadeRoutes.js';
import produtoRoutes from './produtoRoutes.js';
import pedidoRoutes from './pedidoRoutes.js';
import fidelidadeRoutes from './fidelidadeRoutes.js';
import auditoriaRoutes from './auditoriaRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/unidades', unidadeRoutes);
apiRouter.use('/produtos', produtoRoutes);
apiRouter.use('/pedidos', pedidoRoutes);
apiRouter.use('/fidelidade', fidelidadeRoutes);
apiRouter.use('/auditoria', auditoriaRoutes);

export default apiRouter;

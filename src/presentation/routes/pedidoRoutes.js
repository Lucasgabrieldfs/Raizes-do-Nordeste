import { Router } from 'express';
import {
  PedidoController,
  createPedidoSchema,
  processPaymentSchema,
  updateStatusSchema
} from '../controllers/pedidoController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';

const router = Router();

// POST /pedidos - Criação de Pedido (Validação de canalPedido e estoque)
router.post(
  '/',
  optionalAuthMiddleware,
  validateSchema(createPedidoSchema),
  PedidoController.create
);

// GET /pedidos - Listagem com filtros (?canalPedido=TOTEM&status=AGUARDANDO_PAGAMENTO) - Requer Auth
router.get('/', authMiddleware, PedidoController.list);

// GET /pedidos/:id - Detalhes do Pedido
router.get('/:id', optionalAuthMiddleware, PedidoController.getById);

// POST /pedidos/:id/pagamento - Processamento via Gateway Mock (Fluxo A)
router.post(
  '/:id/pagamento',
  optionalAuthMiddleware,
  validateSchema(processPaymentSchema),
  PedidoController.processPayment
);

// PATCH /pedidos/:id/status - Atualização de status da Cozinha KDS (Apenas COZINHA, ATENDENTE, ADMIN)
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['COZINHA', 'ATENDENTE', 'ADMIN']),
  validateSchema(updateStatusSchema),
  PedidoController.updateStatus
);

export default router;

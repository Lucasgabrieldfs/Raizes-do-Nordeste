import { Router } from 'express';
import { AuditoriaController } from '../controllers/auditoriaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

// Apenas ADMIN pode consultar os logs de auditoria
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), AuditoriaController.list);

export default router;

import { Router } from 'express';
import { UnidadeController } from '../controllers/unidadeController.js';

const router = Router();

router.get('/', UnidadeController.list);
router.get('/:id/produtos', UnidadeController.getMenuByUnidade);

export default router;

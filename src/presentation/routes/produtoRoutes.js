import { Router } from 'express';
import { ProdutoController } from '../controllers/produtoController.js';

const router = Router();

router.get('/', ProdutoController.list);
router.get('/:id', ProdutoController.getById);

export default router;

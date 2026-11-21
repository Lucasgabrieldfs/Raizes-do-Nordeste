import { Router } from 'express';
import { FidelidadeController, consentFidelidadeSchema } from '../controllers/fidelidadeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';

const router = Router();

router.get('/extrato', authMiddleware, FidelidadeController.getBalance);
router.post('/consentimento', authMiddleware, validateSchema(consentFidelidadeSchema), FidelidadeController.updateConsent);

export default router;

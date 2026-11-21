import { Router } from 'express';
import { AuthController, registerSchema, loginSchema } from '../controllers/authController.js';
import { validateSchema } from '../middlewares/validateSchema.js';

const router = Router();

router.post('/register', validateSchema(registerSchema), AuthController.register);
router.post('/login', validateSchema(loginSchema), AuthController.login);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginDto } from '../dto/auth.dto';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginDto), authController.login);

export default router;

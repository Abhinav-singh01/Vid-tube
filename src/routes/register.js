import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { registerUser, loginUser, logout } from '../controllers/register.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = Router();


router.post(
    '/register',
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser
);


router.post('/login', loginUser);


router.post('/logout', verifyToken, logout);

export default router;

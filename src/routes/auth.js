import AuthController from '../controllers/authController.js';

const authController = new AuthController();

export default async function authRoutes(fastify) {
    fastify.post('/login', authController.login);
} 
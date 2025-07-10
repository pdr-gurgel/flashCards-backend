import UserController from '../controllers/userController.js';

const userController = new UserController();

async function userRoutes(fastify, options) {
    fastify.post('/register', userController.register);
}

export default userRoutes; 
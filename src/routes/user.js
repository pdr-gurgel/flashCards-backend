import * as userController from '../controllers/userController.js';

async function userRoutes(fastify, options) {
    fastify.post('/register', userController.register);
}

export default userRoutes; 
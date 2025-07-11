import UserService from '../services/userService.js';
import validator from 'validator';

class UserController {
    constructor() {
        this.userService = new UserService();
        this.register = this.register.bind(this);
    }

    /**
     * Registra um novo usuário
     * @param {FastifyRequest} request - Requisição Fastify
     * @param {FastifyReply} reply - Resposta Fastify
     */
    async register(request, reply) {
        const { username, email, password } = request.body;

        // Validações básicas
        if (!username || !email || !password) {
            return reply.code(400).send({ error: 'Todos os campos são obrigatórios.' });
        }

        if (typeof username !== 'string' || username.length < 5) {
            return reply.code(400).send({ error: 'Username deve ter pelo menos 5 caracteres.' });
        }

        if (!validator.isEmail(email)) {
            return reply.code(400).send({ error: 'Email inválido.' });
        }

        if (password.length < 8) {
            return reply.code(400).send({ error: 'A senha deve ter pelo menos 8 caracteres.' });
        }

        try {
            const user = await this.userService.createUser({ username, email, password });

            return reply.code(201).send({
                id: user.id,
                username: user.username,
                email: user.email
            });
        } catch (err) {
            if (err.message === 'Email já está em uso' || err.code === '23505') {
                return reply.code(409).send({ error: 'Usuário ou email já cadastrado.' });
            }

            console.error('Erro ao registrar usuário:', err);
            return reply.code(500).send({ error: 'Erro ao registrar usuário.' });
        }
    }
}

export default UserController; 
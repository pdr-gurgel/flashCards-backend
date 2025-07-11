import AuthService from '../services/authService.js';

class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.login = this.login.bind(this);
    }

    /**
     * Autentica um usuário e retorna token JWT
     * @param {FastifyRequest} req - Requisição Fastify
     * @param {FastifyReply} reply - Resposta Fastify
     */
    async login(req, reply) {
        const { email, password } = req.body;

        if (!email || !password) {
            return reply.code(400).send({ error: 'Email e senha são obrigatórios.' });
        }

        try {
            const { token, user } = await this.authService.loginUser(email, password);
            return reply.code(200).send({ token, user });
        } catch (err) {
            if (err.message === 'Credenciais inválidas') {
                return reply.code(401).send({ error: 'Credenciais inválidas.' });
            }
            console.error('Erro ao realizar login:', err);
            return reply.code(500).send({ error: 'Erro interno do servidor.' });
        }
    }
}

export default AuthController;
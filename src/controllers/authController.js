import AuthService from '../services/authService.js';

class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.login = this.login.bind(this);
    }

    async login(req, reply) {
        const { email, password } = req.body;
        if (!email || !password) {
            return reply.code(400).send({ error: 'Email e senha são obrigatórios.' });
        }
        try {
            const { token, user } = await this.authService.loginUser(email, password);
            return reply.send({ token, user });
        } catch (err) {
            if (err.message === 'Credenciais inválidas') {
                return reply.code(401).send({ error: 'Credenciais inválidas.' });
            }
            return reply.code(500).send({ error: 'Erro interno do servidor.' });
        }
    }
}

export default AuthController; 
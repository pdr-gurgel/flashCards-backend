import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

class AuthService {
    /**
     * Autentica um usuário e gera um token JWT
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Objeto contendo token e dados do usuário
     * @throws {Error} Se as credenciais forem inválidas
     */
    async loginUser(email, password) {
        const user = await User.findByEmail(email);
        if (!user) throw new Error('E-mail não encontrado');

        if (!await bcrypt.compare(password, user.password)) {
            throw new Error('Senha incorreta');
        }

        const payload = { id: user.id, username: user.username, email: user.email };
        const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
        return { token, user: payload };
    }
}

export default AuthService;
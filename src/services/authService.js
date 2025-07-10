import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserService from './userService.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES_IN = '1h';

class AuthService {
    constructor() {
        this.userService = new UserService();
    }

    async loginUser(email, password) {
        const user = await this.userService.getUserByEmail(email);
        if (!user) throw new Error('E-mail não existente');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Credenciais inválidas');
        // Não incluir senha no payload
        const payload = { id: user.id, username: user.username, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { token, user: payload };
    }
}

export default AuthService; 
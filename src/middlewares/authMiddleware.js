import jwt from 'jsonwebtoken';
import config from '../config/index.js';

class AuthMiddleware {
    authenticateJWT(req, reply, done) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return reply.code(401).send({ error: 'Token não fornecido.' });
        }

        const token = authHeader.split(' ')[1]; // Espera formato: Bearer <token>
        if (!token) {
            return reply.code(401).send({ error: 'Token mal formatado.' });
        }

        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            req.user = decoded;
            done();
        } catch (err) {
            return reply.code(401).send({ error: 'Token inválido ou expirado.' });
        }
    }
}

export default new AuthMiddleware(); 
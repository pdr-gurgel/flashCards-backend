import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

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
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Disponibiliza os dados do usuário para a rota
            done();
        } catch (err) {
            return reply.code(401).send({ error: 'Token inválido ou expirado.' });
        }
    }
}

export default new AuthMiddleware(); 
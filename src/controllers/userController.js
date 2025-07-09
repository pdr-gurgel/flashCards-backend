import * as userService from '../services/userService.js';
import validator from 'validator';

// Registro de usuário
export async function register(request, reply) {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
        return reply.status(400).send({ error: 'Todos os campos são obrigatórios.' });
    }
    if (typeof username !== 'string' || username.length < 5) {
        return reply.status(400).send({ error: 'Username deve ter pelo menos 5 caracteres.' });
    }
    if (!validator.isEmail(email)) {
        return reply.status(400).send({ error: 'Email inválido.' });
    }
    if (password.length < 8) {
        return reply.status(400).send({ error: 'A senha deve ter pelo menos 8 caracteres.' });
    }

    try {
        const user = await userService.createUser({ username, email, password });
        return reply.status(201).send({ id: user.id, username: user.username, email: user.email });
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            return reply.status(409).send({ error: 'Usuário ou email já cadastrado.' });
        }
        return reply.status(500).send({ error: 'Erro ao registrar usuário.' });
    }
} 
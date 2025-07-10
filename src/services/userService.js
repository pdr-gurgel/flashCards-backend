import client from '../models/db.js';
import bcrypt from 'bcrypt';

class UserService {
    async createUser({ username, email, password }) {
        try {
            console.log('🔧 UserService: Iniciando criação de usuário:', { username, email });
            // Hash da senha
            console.log('🔧 UserService: Gerando hash da senha...');
            const passwordHash = await bcrypt.hash(password, 10);
            console.log('🔧 UserService: Hash da senha gerado com sucesso');
            // Inserção no banco usando pg client
            console.log('🔧 UserService: Executando query de inserção...');
            const result = await client.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
                [username, email, passwordHash]
            );
            console.log('🔧 UserService: Usuário criado com sucesso:', result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error('❌ UserService: Erro ao criar usuário');
            console.error('❌ Tipo do erro:', error.constructor.name);
            console.error('❌ Mensagem do erro:', error.message);
            console.error('❌ Stack trace:', error.stack);
            if (error.code) {
                console.error('❌ Código do erro PostgreSQL:', error.code);
            }
            if (error.constraint) {
                console.error('❌ Constraint violada:', error.constraint);
            }
            if (error.detail) {
                console.error('❌ Detalhes do erro:', error.detail);
            }
            throw error;
        }
    }
    async getUserByEmail(email) {
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }
}

export default UserService; 
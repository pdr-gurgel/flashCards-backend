import bcrypt from 'bcrypt';
import User from '../models/User.js';

class UserService {
    /**
     * Cria um novo usuário após validações e geração de hash da senha
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Usuário criado
     */
    async createUser({ username, email, password }) {
        try {
            console.log('🔧 UserService: Iniciando criação de usuário:', { username, email });

            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                throw new Error('Email já está em uso');
            }

            console.log('🔧 UserService: Gerando hash da senha...');
            const passwordHash = await bcrypt.hash(password, 10);
            console.log('🔧 UserService: Hash da senha gerado com sucesso');

            const user = await User.create({ username, email, passwordHash });
            return user;
        } catch (error) {
            console.error('❌ UserService: Erro ao criar usuário:', error.message);
            throw error;
        }
    }
    /**
     * Busca um usuário pelo email
     * @param {string} email - Email do usuário
     * @returns {Promise<Object|null>} Objeto do usuário ou null
     */
    async getUserByEmail(email) {
        return await User.findByEmail(email);
    }
}

export default UserService; 
import client from './db.js';

class User {
  /**
   * Busca um usuário pelo email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} Objeto do usuário ou null se não encontrado
   */
  static async findByEmail(email) {
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Model User: Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @param {string} userData.username - Nome de usuário
   * @param {string} userData.email - Email
   * @param {string} userData.passwordHash - Senha já com hash
   * @returns {Promise<Object>} Dados do usuário criado
   */
  static async create({ username, email, passwordHash }) {
    try {
      console.log('🔧 Model User: Executando query de inserção...');
      const result = await client.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, passwordHash]
      );
      console.log('🔧 Model User: Usuário criado com sucesso:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Model User: Erro ao criar usuário');
      console.error('❌ Tipo do erro:', error.constructor.name);
      console.error('❌ Mensagem do erro:', error.message);
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

  /**
   * Busca um usuário pelo ID
   * @param {number} id - ID do usuário
   * @returns {Promise<Object|null>} Objeto do usuário ou null se não encontrado
   */
  static async findById(id) {
    try {
      const result = await client.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Model User: Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }
}

export default User;
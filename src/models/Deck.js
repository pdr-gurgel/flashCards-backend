import client from './db.js';

class Deck {
    /**
     * Busca todos os decks de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Array>} Lista de decks
     */
    static async findByUserId(userId) {
        try {
            const result = await client.query(
                'SELECT id, title, icon, color, user_id FROM decks WHERE user_id = $1 ORDER BY title',
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar decks por userId:', error);
            throw error;
        }
    }

    /**
     * Busca um deck específico de um usuário
     * @param {number} userId - ID do usuário
     * @param {number} deckId - ID do deck
     * @returns {Promise<Object|null>} Deck ou null
     */
    static async findById(userId, deckId) {
        try {
            const result = await client.query(
                'SELECT id, title, icon, color, user_id FROM decks WHERE id = $1 AND user_id = $2',
                [deckId, userId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar deck por id:', error);
            throw error;
        }
    }

    /**
     * Cria um novo deck
     * @param {Object} deckData - Dados do deck
     * @param {number} deckData.user_id - ID do usuário
     * @param {string} deckData.title - Título do deck
     * @param {string} deckData.icon - Ícone do deck (Font Awesome)
     * @param {string} deckData.color - Cor do deck (formato hexadecimal)
     * @returns {Promise<Object>} Deck criado
     */
    static async create({ user_id, title, icon, color }) {
        try {
            console.log('Criando deck:', { user_id, title, icon, color });
            const result = await client.query(
                `INSERT INTO decks (user_id, title, icon, color) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, title, icon, color, user_id`,
                [user_id, title, icon, color]
            );
            console.log('Deck criado com sucesso:', result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar deck:', error);
            throw error;
        }
    }
}

export default Deck;
import client from './db.js';

class Card {
    /**
     * Busca todos os cards de um usuário específico
     * @param {number} userId - ID do usuário
     * @returns {Promise<Array>} Lista de cards do usuário
     */
    static async findByUserId(userId) {
        try {
            const result = await client.query(
                `SELECT c.id, c.deck_id, c.question, c.response, c.difficulty 
                FROM cards c
                JOIN decks d ON c.deck_id = d.id
                WHERE d.user_id = $1
                ORDER BY c.id`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar cards por userId:', error);
            throw error;
        }
    }

    /**
    /**
     * Busca todos os cards de um deck específico
     * @param {number} deckId - ID do deck
     * @returns {Promise<Array>} Lista de cards
     */
    static async findByDeckId(deckId) {
        try {
            const result = await client.query(
                'SELECT id, deck_id, question, response, difficulty FROM cards WHERE deck_id = $1 ORDER BY id',
                [deckId]
            );
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar cards por deckId:', error);
            throw error;
        }
    }

    /**
     * Busca um card específico
     * @param {number} id - ID do card
     * @returns {Promise<Object|null>} Card encontrado ou null
     */
    static async findById(id) {
        try {
            const result = await client.query(
                'SELECT id, deck_id, question, response, difficulty FROM cards WHERE id = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar card por id:', error);
            throw error;
        }
    }

    /**
     * Verifica se um card pertence a um usuário
     * @param {number} cardId - ID do card
     * @param {number} userId - ID do usuário
     * @returns {Promise<boolean>} true se pertencer ao usuário
     */
    static async belongsToUser(cardId, userId) {
        try {
            const result = await client.query(
                `SELECT 1 FROM cards c
                JOIN decks d ON c.deck_id = d.id
                WHERE c.id = $1 AND d.user_id = $2`,
                [cardId, userId]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar dono do card:', error);
            throw error;
        }
    }

    /**
     * Cria um novo card
     * @param {Object} cardData - Dados do card
     * @param {number} cardData.deck_id - ID do deck
     * @param {string} cardData.question - Pergunta do card
     * @param {string} cardData.response - Resposta do card
     * @param {number} [cardData.difficulty=1] - Dificuldade inicial (opcional)
     * @returns {Promise<Object>} Card criado
     */
    static async create({ deck_id, question, response, difficulty = 1 }) {
        try {
            const result = await client.query(
                `INSERT INTO cards (deck_id, question, response, difficulty)
                VALUES ($1, $2, $3, $4)
                RETURNING id, deck_id, question, response, difficulty`,
                [deck_id, question, response, difficulty]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar card:', error);
            throw error;
        }
    }

    /**
     * Atualiza um card existente
     * @param {number} id - ID do card
     * @param {Object} updateData - Dados para atualização
     * @param {string} [updateData.question] - Nova pergunta (opcional)
     * @param {string} [updateData.response] - Nova resposta (opcional)
     * @param {number} [updateData.difficulty] - Nova dificuldade (opcional)
     * @returns {Promise<Object|null>} Card atualizado ou null se não encontrado
     */
    static async update(id, { question, response, difficulty }) {
        try {
            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (question !== undefined) {
                updates.push(`question = $${paramIndex++}`);
                values.push(question);
            }
            if (response !== undefined) {
                updates.push(`response = $${paramIndex++}`);
                values.push(response);
            }
            if (difficulty !== undefined) {
                updates.push(`difficulty = $${paramIndex++}`);
                values.push(difficulty);
            }

            if (updates.length === 0) {
                return null; // Nada para atualizar
            }

            values.push(id);
            
            const result = await client.query(
                `UPDATE cards 
                SET ${updates.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING id, deck_id, question, response, difficulty`,
                values
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao atualizar card:', error);
            throw error;
        }
    }

    /**
     * Remove um card
     * @param {number} id - ID do card a ser removido
     * @returns {Promise<boolean>} true se removido com sucesso
     */
    static async delete(id) {
        try {
            const result = await client.query(
                'DELETE FROM cards WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rowCount > 0;
        } catch (error) {
            console.error('Erro ao remover card:', error);
            throw error;
        }
    }
}

export default Card;

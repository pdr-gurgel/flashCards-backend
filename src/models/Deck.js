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

    /**
     * Atualiza um deck existente
     * @param {number} deckId - ID do deck
     * @param {number} userId - ID do usuário (para validação)
     * @param {Object} updateData - Dados para atualização
     * @param {string} [updateData.title] - Novo título
     * @param {string} [updateData.icon] - Novo ícone
     * @param {string} [updateData.color] - Nova cor
     * @returns {Promise<Object|null>} Deck atualizado ou null se não encontrado
     */
    static async update(deckId, userId, { title, icon, color }) {
        try {
            // Verificar se o deck pertence ao usuário
            const existingDeck = await this.findById(userId, deckId);
            if (!existingDeck) {
                return null;
            }

            // Construir a query dinamicamente com base nos campos fornecidos
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            if (title !== undefined) {
                updateFields.push(`title = $${paramIndex++}`);
                values.push(title);
            }

            if (icon !== undefined) {
                updateFields.push(`icon = $${paramIndex++}`);
                values.push(icon);
            }

            if (color !== undefined) {
                updateFields.push(`color = $${paramIndex++}`);
                values.push(color);
            }

            // Se não houver campos para atualizar, retornar o deck existente
            if (updateFields.length === 0) {
                return existingDeck;
            }

            // Adicionar o ID do deck e do usuário aos valores
            values.push(deckId);
            values.push(userId);

            const result = await client.query(
                `UPDATE decks 
                 SET ${updateFields.join(', ')} 
                 WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} 
                 RETURNING id, title, icon, color, user_id`,
                values
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao atualizar deck:', error);
            throw error;
        }
    }

    /**
     * Deleta um deck existente
     * @param {number} deckId - ID do deck
     * @param {number} userId - ID do usuário (para validação)
     * @returns {Promise<boolean>} true se deletado, false se não encontrado ou não autorizado
     */
    static async delete(deckId, userId) {
        try {
            // Verificar se o deck pertence ao usuário
            const existingDeck = await this.findById(userId, deckId);
            if (!existingDeck) {
                return false;
            }
            const result = await client.query(
                'DELETE FROM decks WHERE id = $1 AND user_id = $2',
                [deckId, userId]
            );
            return result.rowCount > 0;
        } catch (error) {
            console.error('Erro ao deletar deck:', error);
            throw error;
        }
    }

    /**
     * Conta a quantidade de decks de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<number>} Número de decks do usuário
     */
    static async countByUserId(userId) {
        try {
            const result = await client.query(
                'SELECT COUNT(*)::int as count FROM decks WHERE user_id = $1',
                [userId]
            );
            return result.rows[0].count;
        } catch (error) {
            console.error('Erro ao contar decks por userId:', error);
            throw error;
        }
    }
} // Fim da classe Deck

export default Deck;
import client from './db.js';

class Deck {
    /**
     * Busca todos os decks de um usuário, incluindo cardsCount
     * @param {number} userId
     * @returns {Promise<Array>} Lista de decks
     */
    static async findByUserId(userId) {
        try {
            const result = await client.query(`
                SELECT d.id, d.title, d.icon, d.color,
                    COUNT(c.id) AS "cardsCount"
                FROM decks d
                LEFT JOIN cards c ON c.deck_id = d.id
                WHERE d.user_id = $1
                GROUP BY d.id, d.title, d.icon, d.color
                ORDER BY d.id ASC
            `, [userId]);
            return result.rows.map(row => ({
                id: row.id,
                title: row.title,
                icon: row.icon,
                color: row.color,
                cardsCount: Number(row.cardsCount)
            }));
        } catch (error) {
            console.error('Erro ao buscar decks:', error);
            throw error;
        }
    }

    /**
     * Cria um novo deck no banco de dados
     * @param {Object} data - { userId, title, icon, color }
     * @returns {Promise<Object>} Deck criado
     */
    static async create({ userId, title, icon, color }) {
        try {
            const result = await client.query(
                `INSERT INTO decks (user_id, title, icon, color)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, title, icon, color`,
                [userId, title, icon, color]
            );
            return {
                id: result.rows[0].id,
                title: result.rows[0].title,
                icon: result.rows[0].icon,
                color: result.rows[0].color,
                cardsCount: 0
            };
        } catch (error) {
            console.error('Erro ao criar deck:', error);
            throw error;
        }
    }
}

export default Deck; 
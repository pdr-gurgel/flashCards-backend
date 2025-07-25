import Deck from '../models/Deck.js';

class DeckService {
    /**
     * Busca todos os decks de um usuário
     * @param {number} userId
     * @returns {Promise<Array>} Lista de decks
     */
    async getDecksByUser(userId) {
        // Busca decks e inclui cardsCount e progress
        return await Deck.findByUserId(userId);
    }

    /**
     * Cria um novo deck para o usuário
     * @param {Object} data - { userId, title, icon, color }
     * @returns {Promise<Object>} Deck criado
     */
    async createDeck({ userId, title, icon, color }) {
        return await Deck.create({ user_id: userId, title, icon, color });
    }

    /**
     * Atualiza um deck existente
     * @param {number} deckId - ID do deck a ser atualizado
     * @param {number} userId - ID do usuário para validação de propriedade
     * @param {Object} updateData - Dados para atualização
     * @returns {Promise<Object|null>} Deck atualizado ou null se não encontrado ou não pertencer ao usuário
     */
    async updateDeck(deckId, userId, { title, icon, color }) {
        return await Deck.update(deckId, userId, { title, icon, color });
    }
}

export default DeckService; 
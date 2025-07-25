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
        return await Deck.create({ userId, title, icon, color });
    }
}

export default DeckService; 
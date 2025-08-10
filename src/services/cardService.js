import Card from '../models/Card.js';
import Deck from '../models/Deck.js';

class CardService {
    constructor() {
        this.cardModel = Card;
        this.deckModel = Deck;
    }

    /**
     * Busca todos os cards de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Array>} Lista de cards do usuário
     */
    async getCardsByUser(userId) {
        try {
            return await this.cardModel.findByUserId(userId);
        } catch (error) {
            console.error('Erro no serviço ao buscar cards do usuário:', error);
            throw error;
        }
    }

    /**
     * Conta o número total de cards de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<number>} Número total de cards do usuário
     */
    async countCardsByUser(userId) {
        try {
            return await this.cardModel.countByUserId(userId);
        } catch (error) {
            console.error('Erro no serviço ao contar cards do usuário:', error);
            throw error;
        }
    }

    /**
     * Busca todos os cards de um deck específico
     * @param {number} deckId - ID do deck
     * @param {number} userId - ID do usuário para validação de permissão
     * @returns {Promise<Array>} Lista de cards do deck
     */
    async getCardsByDeck(deckId, userId) {
        try {
            // Verifica se o deck pertence ao usuário
            const deck = await this.deckModel.findById(userId, deckId);
            if (!deck) {
                throw new Error('Deck não encontrado ou você não tem permissão para acessá-lo');
            }

            return await this.cardModel.findByDeckId(deckId);
        } catch (error) {
            console.error('Erro no serviço ao buscar cards do deck:', error);
            throw error;
        }
    }

    /**
     * Busca um card específico
     * @param {number} cardId - ID do card
     * @param {number} userId - ID do usuário para validação de permissão
     * @returns {Promise<Object>} Card encontrado
     */
    async getCardById(cardId, userId) {
        try {
            const card = await this.cardModel.findById(cardId);
            if (!card) {
                throw new Error('Card não encontrado');
            }

            // Verifica se o usuário tem permissão para acessar este card
            const hasPermission = await this.cardModel.belongsToUser(cardId, userId);
            if (!hasPermission) {
                throw new Error('Você não tem permissão para acessar este card');
            }

            return card;
        } catch (error) {
            console.error('Erro no serviço ao buscar card por ID:', error);
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
     * @param {number} userId - ID do usuário para validação de permissão
     * @returns {Promise<Object>} Card criado
     */
    async createCard(cardData, userId) {
        try {
            const { deck_id, question, response, difficulty = 1 } = cardData;

            // Validação básica
            if (!question || !response) {
                throw new Error('Pergunta e resposta são obrigatórias');
            }

            // Verifica se o deck pertence ao usuário
            const deck = await this.deckModel.findById(userId, deck_id);
            if (!deck) {
                throw new Error('Deck não encontrado ou você não tem permissão para adicionar cards a ele');
            }

            // Cria o card
            return await this.cardModel.create({
                deck_id,
                question: question.trim(),
                response: response.trim(),
                difficulty
            });
        } catch (error) {
            console.error('Erro no serviço ao criar card:', error);
            throw error;
        }
    }

    /**
     * Atualiza um card existente
     * @param {number} cardId - ID do card a ser atualizado
     * @param {Object} updateData - Dados para atualização
     * @param {string} [updateData.question] - Nova pergunta (opcional)
     * @param {string} [updateData.response] - Nova resposta (opcional)
     * @param {number} [updateData.difficulty] - Nova dificuldade (opcional)
     * @param {number} userId - ID do usuário para validação de permissão
     * @returns {Promise<Object>} Card atualizado
     */
    async updateCard(cardId, updateData, userId) {
        try {
            // Verifica se o card existe e pertence ao usuário
            const card = await this.cardModel.findById(cardId);
            if (!card) {
                throw new Error('Card não encontrado');
            }

            const hasPermission = await this.cardModel.belongsToUser(cardId, userId);
            if (!hasPermission) {
                throw new Error('Você não tem permissão para editar este card');
            }

            // Atualiza o card
            const updatedCard = await this.cardModel.update(cardId, {
                question: updateData.question,
                response: updateData.response,
                difficulty: updateData.difficulty
            });

            if (!updatedCard) {
                throw new Error('Falha ao atualizar o card');
            }

            return updatedCard;
        } catch (error) {
            console.error('Erro no serviço ao atualizar card:', error);
            throw error;
        }
    }

    /**
     * Remove um card
     * @param {number} cardId - ID do card a ser removido
     * @param {number} userId - ID do usuário para validação de permissão
     * @returns {Promise<boolean>} true se removido com sucesso
     */
    async deleteCard(cardId, userId) {
        try {
            // Verifica se o card existe e pertence ao usuário
            const card = await this.cardModel.findById(cardId);
            if (!card) {
                throw new Error('Card não encontrado');
            }

            const hasPermission = await this.cardModel.belongsToUser(cardId, userId);
            if (!hasPermission) {
                throw new Error('Você não tem permissão para remover este card');
            }

            // Remove o card
            const deleted = await this.cardModel.delete(cardId);
            if (!deleted) {
                throw new Error('Falha ao remover o card');
            }

            return true;
        } catch (error) {
            console.error('Erro no serviço ao remover card:', error);
            throw error;
        }
    }

    /**
     * Importa múltiplos cards para um deck
     * @param {Array<Object>} cards - Lista de cards a serem importados
     * @param {number} deckId - ID do deck de destino
     * @param {number} userId - ID do usuário para validação de permissão
     * @returns {Promise<Array>} Lista de cards criados
     */
    async importCards(cards, deckId, userId) {
        try {
            // 1. Valida se o deck pertence ao usuário
            const deck = await this.deckModel.findById(userId, deckId);
            if (!deck) {
                throw new Error('Deck não encontrado ou você não tem permissão para acessá-lo');
            }

            // 2. Validação básica da estrutura dos cards
            if (!Array.isArray(cards) || cards.length === 0) {
                throw new Error('A lista de cards está vazia ou em formato inválido.');
            }

            for (const card of cards) {
                if (!card.question || !card.response) {
                    throw new Error('Todos os cards devem conter os campos \'question\' e \'response\'.');
                }
            }

            // 3. Chama o método do model para criação em lote
            return await this.cardModel.createMany(cards, deckId);
        } catch (error) {
            console.error('Erro no serviço ao importar cards:', error);
            // Repassa o erro para ser tratado pelo controller
            throw error;
        }
    }
}

export default CardService;

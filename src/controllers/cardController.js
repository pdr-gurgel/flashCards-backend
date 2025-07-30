import CardService from '../services/cardService.js';

class CardController {
    constructor() {
        this.cardService = new CardService();

        // Bind dos métodos para garantir que 'this' se refira à instância da classe
        this.getUserCards = this.getUserCards.bind(this);
        this.countUserCards = this.countUserCards.bind(this);
        this.getCards = this.getCards.bind(this);
        this.getCard = this.getCard.bind(this);
        this.createCard = this.createCard.bind(this);
        this.updateCard = this.updateCard.bind(this);
        this.deleteCard = this.deleteCard.bind(this);
    }

    /**
     * Lista todos os cards de um usuário
     */
    async getUserCards(req, reply) {
        try {
            const userId = req.user.id;
            const cards = await this.cardService.getCardsByUser(userId);
            return reply.code(200).send(cards);
        } catch (error) {
            console.error('Erro ao listar cards do usuário:', error);
            return reply.code(400).send({ error: error.message || 'Erro ao listar cards do usuário' });
        }
    }

    /**
     * Retorna a contagem total de cards de um usuário
     */
    async countUserCards(req, reply) {
        try {
            const userId = req.user.id;
            const count = await this.cardService.countCardsByUser(userId);
            return reply.code(200).send({ count });
        } catch (error) {
            console.error('Erro ao contar cards do usuário:', error);
            return reply.code(500).send({
                error: error.message || 'Erro ao contar cards do usuário'
            });
        }
    }

    /**
     * Lista todos os cards de um deck
     */
    async getCards(req, reply) {
        try {
            const { deckId } = req.params;
            const userId = req.user.id;

            const cards = await this.cardService.getCardsByDeck(deckId, userId);
            return reply.code(200).send(cards);
        } catch (error) {
            console.error('Erro ao listar cards:', error);
            return reply.code(400).send({ error: error.message || 'Erro ao listar cards' });
        }
    }

    /**
     * Obtém um card específico
     */
    async getCard(req, reply) {
        try {
            const { cardId } = req.params;
            const userId = req.user.id;

            const card = await this.cardService.getCardById(cardId, userId);
            return reply.code(200).send(card);
        } catch (error) {
            console.error('Erro ao buscar card:', error);
            const statusCode = error.message.includes('não encontrado') ? 404 : 400;
            return reply.code(statusCode).send({ error: error.message });
        }
    }

    /**
     * Cria um novo card
     */
    async createCard(req, reply) {
        try {
            const { deckId } = req.params;
            const userId = req.user.id;
            const { question, response, difficulty } = req.body;

            // Validação básica
            if (!question || !response) {
                return reply.code(400).send({ error: 'Pergunta e resposta são obrigatórias' });
            }

            const card = await this.cardService.createCard(
                { deck_id: deckId, question, response, difficulty },
                userId
            );

            return reply.code(201).send(card);
        } catch (error) {
            console.error('Erro ao criar card:', error);
            const statusCode = error.message.includes('não encontrado') ? 404 : 400;
            return reply.code(statusCode).send({ error: error.message });
        }
    }

    /**
     * Atualiza um card existente
     */
    async updateCard(req, reply) {
        try {
            const { cardId } = req.params;
            const userId = req.user.id;
            const { question, response, difficulty } = req.body;

            // Verifica se pelo menos um campo para atualização foi fornecido
            if (!question && !response && !difficulty) {
                return reply.code(400).send({ error: 'Nenhum dado para atualização fornecido' });
            }

            const updatedCard = await this.cardService.updateCard(
                cardId,
                { question, response, difficulty },
                userId
            );

            return reply.code(200).send(updatedCard);
        } catch (error) {
            console.error('Erro ao atualizar card:', error);
            const statusCode = error.message.includes('não encontrado') ? 404 : 400;
            return reply.code(statusCode).send({ error: error.message });
        }
    }

    /**
     * Remove um card
     */
    async deleteCard(req, reply) {
        try {
            const { cardId } = req.params;
            const userId = req.user.id;

            await this.cardService.deleteCard(cardId, userId);
            return reply.code(204).send();
        } catch (error) {
            console.error('Erro ao remover card:', error);
            const statusCode = error.message.includes('não encontrado') ? 404 : 400;
            return reply.code(statusCode).send({ error: error.message });
        }
    }
}

export default CardController;

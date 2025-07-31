import DeckService from '../services/deckService.js';

class DeckController {
    constructor() {
        this.deckService = new DeckService();
        this.getAllDecks = this.getAllDecks.bind(this);
        this.createDeck = this.createDeck.bind(this);
        this.updateDeck = this.updateDeck.bind(this);
        this.deleteDeck = this.deleteDeck.bind(this);
        this.countCardsByDeckId = this.countCardsByDeckId.bind(this);
        this.countUserDecks = this.countUserDecks.bind(this);
    }

    /**
     * Lista todos os decks do usuário autenticado
     */
    async getAllDecks(req, reply) {
        try {
            const userId = req.user.id;
            const decks = await this.deckService.getDecksByUser(userId);
            return reply.code(200).send(decks);
        } catch (err) {
            console.error('Erro ao listar decks:', err);
            return reply.code(500).send({ error: 'Erro ao buscar decks.' });
        }
    }

    /**
     * Cria um novo deck para o usuário autenticado
     */
    async createDeck(req, reply) {
        try {
            const userId = req.user.id;
            const { title, icon, color } = req.body;

            // Validação básica
            if (!title || typeof title !== 'string' || title.trim().length < 2) {
                return reply.code(400).send({ error: 'Título do deck é obrigatório e deve ter pelo menos 2 caracteres.' });
            }
            if (!icon || typeof icon !== 'string') {
                return reply.code(400).send({ error: 'Ícone do deck é obrigatório.' });
            }
            if (!color || typeof color !== 'string') {
                return reply.code(400).send({ error: 'Cor do deck é obrigatória.' });
            }

            const deck = await this.deckService.createDeck({ userId, title: title.trim(), icon, color });
            return reply.code(201).send(deck);
        } catch (err) {
            console.error('Erro ao criar deck:', err);
            return reply.code(500).send({ error: 'Erro ao criar deck.' });
        }
    }

    /**
     * Atualiza um deck existente do usuário autenticado
     */
    async updateDeck(req, reply) {
        try {
            const userId = req.user.id;
            const deckId = parseInt(req.params.id);
            const { title, icon, color } = req.body;

            // Validação básica
            if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2)) {
                return reply.code(400).send({ error: 'Título do deck deve ter pelo menos 2 caracteres.' });
            }
            if (icon !== undefined && typeof icon !== 'string') {
                return reply.code(400).send({ error: 'Ícone do deck deve ser uma string válida.' });
            }
            if (color !== undefined && typeof color !== 'string') {
                return reply.code(400).send({ error: 'Cor do deck deve ser uma string válida.' });
            }

            // Tenta atualizar o deck
            const updatedDeck = await this.deckService.updateDeck(
                deckId,
                userId,
                {
                    title: title ? title.trim() : undefined,
                    icon,
                    color
                }
            );

            // Se o deck não existe ou não pertence ao usuário
            if (!updatedDeck) {
                return reply.code(404).send({ error: 'Deck não encontrado.' });
            }

            return reply.code(200).send(updatedDeck);
        } catch (err) {
            console.error('Erro ao atualizar deck:', err);
            return reply.code(500).send({ error: 'Erro ao atualizar deck.' });
        }
    }
    /**
     * Deleta um deck existente do usuário autenticado
     */
    async deleteDeck(req, reply) {
        try {
            const userId = req.user.id;
            const deckId = parseInt(req.params.id);
            const deleted = await this.deckService.deleteDeck(deckId, userId);
            if (!deleted) {
                return reply.code(404).send({ error: 'Deck não encontrado.' });
            }
            return reply.code(204).send(); // No Content
        } catch (err) {
            console.error('Erro ao deletar deck:', err);
            return reply.code(500).send({ error: 'Erro ao deletar deck.' });
        }
    }
    /**
     * Retorna a quantidade de cards de um deck específico
     */
    async countCardsByDeckId(req, reply) {
        try {
            const deckId = parseInt(req.params.id);
            if (isNaN(deckId)) {
                return reply.code(400).send({ error: 'ID do deck inválido.' });
            }
            const count = await this.deckService.countCardsByDeckId(deckId);
            return reply.code(200).send({ count });
        } catch (err) {
            console.error('Erro ao contar cards do deck:', err);
            return reply.code(500).send({ error: 'Erro ao contar cards do deck.' });
        }
    }

    /**
     * Retorna a quantidade de decks do usuário autenticado
     */
    async countUserDecks(req, reply) {
        try {
            const userId = req.user.id;
            const count = await this.deckService.countDecksByUser(userId);
            return reply.code(200).send({ count });
        } catch (err) {
            console.error('Erro ao contar decks do usuário:', err);
            return reply.code(500).send({ error: 'Erro ao contar decks.' });
        }
    }
}

export default DeckController;

import DeckService from '../services/deckService.js';

class DeckController {
    constructor() {
        this.deckService = new DeckService();
        this.getAllDecks = this.getAllDecks.bind(this);
        this.createDeck = this.createDeck.bind(this);
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
}

export default DeckController;

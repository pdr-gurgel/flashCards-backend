import CardController from '../controllers/cardController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const cardController = new CardController();

/**
 * Configura as rotas relacionadas aos cards
 * @param {Object} fastify - Instância do Fastify
 */
export default async function cardRoutes(fastify) {
    // Middleware de autenticação para todas as rotas
    fastify.addHook('preHandler', authMiddleware.authenticateJWT);

    // Rota para listar todos os cards do usuário autenticado
    fastify.get('/cards', cardController.getUserCards);

    // Rotas aninhadas para /decks/:deckId/cards
    fastify.register(async (fastify) => {
        // Listar todos os cards de um deck específico
        fastify.get('/decks/:deckId/cards', cardController.getCards);

        // Obter um card específico
        fastify.get('/cards/:cardId', cardController.getCard);

        // Criar um novo card em um deck
        fastify.post('/decks/:deckId/cards', cardController.createCard);

        // Atualizar um card existente
        fastify.put('/cards/:cardId', cardController.updateCard);

        // Remover um card
        fastify.delete('/cards/:cardId', cardController.deleteCard);
    });
}

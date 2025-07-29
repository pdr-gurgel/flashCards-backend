import DeckController from '../controllers/deckController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const deckController = new DeckController();

export default async function deckRoutes(fastify) {
    fastify.get('/decks', { preHandler: authMiddleware.authenticateJWT }, deckController.getAllDecks);
    fastify.post('/decks', { preHandler: authMiddleware.authenticateJWT }, deckController.createDeck);
    fastify.put('/decks/:id', { preHandler: authMiddleware.authenticateJWT }, deckController.updateDeck);
    fastify.delete('/decks/:id', { preHandler: authMiddleware.authenticateJWT }, deckController.deleteDeck);
    fastify.get('/decks/:id/cards/count', { preHandler: authMiddleware.authenticateJWT }, deckController.countCardsByDeckId);
}
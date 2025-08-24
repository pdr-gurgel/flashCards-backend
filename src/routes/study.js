import StudyController from '../controllers/studyController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const studyController = new StudyController();

export default async function studyRoutes(fastify) {
    // Health check do sistema de estudo (sem autenticação para debug)
    fastify.get('/study/health', studyController.healthCheck);

    // Estatísticas gerais de estudo
    fastify.get('/study/stats', { preHandler: authMiddleware.authenticateJWT }, studyController.getStats);

    // Cards devidos para revisão
    fastify.get('/study/cards/due', { preHandler: authMiddleware.authenticateJWT }, studyController.getCardsDue);

    // Iniciar sessão de estudo geral
    fastify.get('/study/session', { preHandler: authMiddleware.authenticateJWT }, studyController.startSession);

    // Iniciar sessão de estudo de deck específico
    fastify.get('/study/session/:deckId', { preHandler: authMiddleware.authenticateJWT }, studyController.startSession);

    // Processar revisão de card
    fastify.post('/study/review', { preHandler: authMiddleware.authenticateJWT }, studyController.reviewCard);

    // Progresso de deck específico
    fastify.get('/study/decks/:deckId/progress', { preHandler: authMiddleware.authenticateJWT }, studyController.getDeckProgress);

    // Análise detalhada de estudo
    fastify.get('/study/analysis', { preHandler: authMiddleware.authenticateJWT }, studyController.getStudyAnalysis);

    // Reset progresso de card
    fastify.delete('/study/cards/:cardId', { preHandler: authMiddleware.authenticateJWT }, studyController.resetCardProgress);
}
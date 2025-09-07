import StudyService from '../services/studyService.js';

class StudyController {
    constructor() {
        this.studyService = new StudyService();

        // Bind dos métodos para garantir contexto correto
        this.startSession = this.startSession.bind(this);
        this.reviewCard = this.reviewCard.bind(this);
        this.getStats = this.getStats.bind(this);
        this.getDeckProgress = this.getDeckProgress.bind(this);
        this.resetCardProgress = this.resetCardProgress.bind(this);
        this.getCardsDue = this.getCardsDue.bind(this);
        this.getStudyAnalysis = this.getStudyAnalysis.bind(this);
        this.healthCheck = this.healthCheck.bind(this);
    }

    /**
     * Inicia uma sessão de estudo
     * GET /study/session/:deckId? ou GET /study/session
     */
    async startSession(req, reply) {
        try {
            const userId = req.user.id;
            const deckId = req.params.deckId ? parseInt(req.params.deckId) : null;
            const limit = parseInt(req.query.limit) || 20;
            const forceAll = req.query.forceAll === 'true';

            // Validar limite
            if (limit < 1 || limit > 100) {
                return reply.code(400).send({
                    success: false,
                    error: 'Limite deve estar entre 1 e 100 cards'
                });
            }

            console.log(`🎓 Iniciando sessão de estudo para usuário ${userId}, deck: ${deckId || 'todos'}, limite: ${limit}`);

            const session = await this.studyService.startStudySession(userId, deckId, limit, forceAll);

            return reply.code(200).send({
                success: true,
                data: session,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erro ao iniciar sessão de estudo:', error);

            const statusCode = error.message.includes('não encontrado') || error.message.includes('não pertence') ? 404 : 500;

            return reply.code(statusCode).send({
                success: false,
                error: error.message || 'Erro interno ao iniciar sessão de estudo',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Processa revisão de um card
     * POST /study/review
     * Body: { cardId: number, difficulty: number }
     */
    async reviewCard(req, reply) {
        try {
            const userId = req.user.id;
            const { cardId, difficulty } = req.body;

            // Validações de entrada
            if (!cardId || typeof cardId !== 'number') {
                return reply.code(400).send({
                    success: false,
                    error: 'cardId é obrigatório e deve ser um número'
                });
            }

            if (!difficulty || ![1, 2, 3].includes(difficulty)) {
                return reply.code(400).send({
                    success: false,
                    error: 'difficulty é obrigatório e deve ser 1 (Difícil), 2 (Médio) ou 3 (Fácil)'
                });
            }

            console.log(`📝 Processando revisão: usuário ${userId}, card ${cardId}, dificuldade ${difficulty}`);

            const result = await this.studyService.reviewCard(userId, cardId, difficulty);

            return reply.code(200).send({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erro ao processar revisão:', error);

            const statusCode = error.message.includes('não encontrado') || error.message.includes('não pertence') ? 404 :
                error.message.includes('deve ser') ? 400 : 500;

            return reply.code(statusCode).send({
                success: false,
                error: error.message || 'Erro interno ao processar revisão',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Busca estatísticas gerais de estudo
     * GET /study/stats
     */
    async getStats(req, reply) {
        try {
            const userId = req.user.id;

            console.log(`📊 Buscando estatísticas para usuário ${userId}`);

            const stats = await this.studyService.getGeneralStats(userId);

            return reply.code(200).send({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erro ao buscar estatísticas:', error);

            return reply.code(500).send({
                success: false,
                error: 'Erro interno ao buscar estatísticas',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Busca progresso de um deck específico
     * GET /study/decks/:deckId/progress
     */
    async getDeckProgress(req, reply) {
        try {
            const userId = req.user.id;
            const deckId = parseInt(req.params.deckId);

            if (!deckId || isNaN(deckId)) {
                return reply.code(400).send({
                    success: false,
                    error: 'ID do deck é obrigatório e deve ser um número válido'
                });
            }

            console.log(`📈 Buscando progresso do deck ${deckId} para usuário ${userId}`);

            const progress = await this.studyService.getDeckProgress(userId, deckId);

            return reply.code(200).send({
                success: true,
                data: progress,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erro ao buscar progresso do deck:', error);

            const statusCode = error.message.includes('não encontrado') || error.message.includes('não pertence') ? 404 : 500;

            return reply.code(statusCode).send({
                success: false,
                error: error.message || 'Erro interno ao buscar progresso do deck',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Reset do progresso de um card
     * DELETE /study/cards/:cardId
     */
    async resetCardProgress(req, reply) {
        try {
            const userId = req.user.id;
            const cardId = parseInt(req.params.cardId);

            if (!cardId || isNaN(cardId)) {
                return reply.code(400).send({
                    success: false,
                    error: 'ID do card é obrigatório e deve ser um número válido'
                });
            }

            console.log(`🔄 Resetando progresso do card ${cardId} para usuário ${userId}`);

            const result = await this.studyService.resetCardProgress(userId, cardId);

            return reply.code(200).send({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erro ao resetar progresso do card:', error);

            const statusCode = error.message.includes('não encontrado') || error.message.includes('não pertence') ? 404 : 500;

            return reply.code(statusCode).send({
                success: false,
                error: error.message || 'Erro interno ao resetar progresso',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Busca cards que estão devidos para revisão hoje
     * GET /study/cards/due
     */
    async getCardsDue(req, reply) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;

            if (limit < 1 || limit > 200) {
                return reply.code(400).send({
                    success: false,
                    error: 'Limite deve estar entre 1 e 200 cards'
                });
            }

            console.log(`📅 Buscando cards devidos para usuário ${userId}, limite: ${limit}`);

            const cardsDue = await this.studyService.getCardsDueToday(userId, limit);

            return reply.code(200).send({
                success: true,
                data: cardsDue,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erro ao buscar cards devidos:', error);

            return reply.code(500).send({
                success: false,
                error: 'Erro interno ao buscar cards devidos',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Busca análise detalhada de estudo
     * GET /study/analysis
     */
    async getStudyAnalysis(req, reply) {
        try {
            const userId = req.user.id;

            console.log(`🔍 Gerando análise de estudo para usuário ${userId}`);

            const analysis = await this.studyService.getStudyAnalysis(userId);

            return reply.code(200).send({
                success: true,
                data: analysis,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erro ao gerar análise de estudo:', error);

            return reply.code(500).send({
                success: false,
                error: 'Erro interno ao gerar análise de estudo',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Health check do sistema de estudo
     * GET /study/health
     */
    async healthCheck(req, reply) {
        try {
            const timestamp = new Date().toISOString();

            return reply.code(200).send({
                success: true,
                service: 'study-system',
                status: 'healthy',
                version: '1.0.0',
                timestamp: timestamp,
                uptime: process.uptime(),
                features: {
                    sm2Algorithm: 'active',
                    sessionManagement: 'active',
                    progressTracking: 'active',
                    statistics: 'active',
                    deckProgress: 'active',
                    studyAnalysis: 'active'
                }
            });
        } catch (error) {
            console.error('❌ Erro no health check:', error);

            return reply.code(500).send({
                success: false,
                service: 'study-system',
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
 * Middleware para log de requisições de estudo
 */
    static logRequest(req, reply, done) {
        const start = Date.now();
        const originalSend = reply.send;

        reply.send = function (payload) {
            const duration = Date.now() - start;
            console.log(`📚 Study API: ${req.method} ${req.url} - ${reply.statusCode || 200} - ${duration}ms`);
            return originalSend.call(this, payload);
        };

        done();
    }
}

export default StudyController;

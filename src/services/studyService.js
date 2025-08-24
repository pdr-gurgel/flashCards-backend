import Study from '../models/Study.js';
import Deck from '../models/Deck.js';
import Card from '../models/Card.js';

class StudyService {
    /**
     * Inicia uma sessão de estudo
     * @param {number} userId - ID do usuário
     * @param {number} deckId - ID do deck (opcional)
     * @param {number} limit - Limite de cards (padrão: 20)
     * @returns {Promise<Object>} Dados da sessão de estudo
     */
    async startStudySession(userId, deckId = null, limit = 20) {
        try {
            // Validar se o deck pertence ao usuário (se especificado)
            if (deckId) {
                const deck = await Deck.findById(userId, deckId);
                if (!deck) {
                    throw new Error('Deck não encontrado ou não pertence ao usuário');
                }
            }

            // Buscar cards para revisão
            const cards = await Study.getCardsForReview(userId, limit, deckId);

            // Buscar estatísticas gerais do usuário
            const stats = await Study.getStudyStats(userId);

            // Informações sobre a sessão
            const sessionInfo = {
                sessionId: `session_${Date.now()}_${userId}`,
                startedAt: new Date().toISOString(),
                deckId: deckId,
                maxCards: limit
            };

            return {
                success: true,
                session: sessionInfo,
                cards: cards,
                totalCards: cards.length,
                stats: stats,
                message: cards.length > 0
                    ? `Sessão iniciada com ${cards.length} cards`
                    : 'Nenhum card disponível para revisão no momento'
            };
        } catch (error) {
            console.error('Erro ao iniciar sessão de estudo:', error);
            throw error;
        }
    }

    /**
     * Processa a revisão de um card aplicando o algoritmo SM-2
     * @param {number} userId - ID do usuário
     * @param {number} cardId - ID do card
     * @param {number} difficulty - Dificuldade (1=Difícil, 2=Médio, 3=Fácil)
     * @returns {Promise<Object>} Resultado da revisão
     */
    async reviewCard(userId, cardId, difficulty) {
        try {
            // Validar entrada
            if (![1, 2, 3].includes(difficulty)) {
                throw new Error('Dificuldade deve ser 1 (Difícil), 2 (Médio) ou 3 (Fácil)');
            }

            // Verificar se o card pertence ao usuário
            const cardExists = await this.validateCardOwnership(userId, cardId);
            if (!cardExists) {
                throw new Error('Card não encontrado ou não pertence ao usuário');
            }

            // Atualizar progresso usando algoritmo SM-2
            const updatedStudy = await Study.updateProgress(userId, cardId, difficulty);

            // Buscar estatísticas atualizadas
            const updatedStats = await Study.getStudyStats(userId);

            // Calcular próxima data de revisão
            const nextReviewDate = this.calculateNextReviewDate(updatedStudy.last_reviewed_at, updatedStudy.interval);

            return {
                success: true,
                reviewResult: {
                    cardId: cardId,
                    difficulty: difficulty,
                    newInterval: updatedStudy.interval,
                    newRepetitions: updatedStudy.repetitions,
                    newEaseFactor: updatedStudy.ease_factor,
                    nextReviewDate: nextReviewDate,
                    lastReviewedAt: updatedStudy.last_reviewed_at
                },
                stats: updatedStats,
                message: this.getReviewFeedbackMessage(difficulty, updatedStudy.interval)
            };
        } catch (error) {
            console.error('Erro ao processar revisão:', error);
            throw error;
        }
    }

    /**
     * Busca progresso detalhado de um deck específico
     * @param {number} userId - ID do usuário
     * @param {number} deckId - ID do deck
     * @returns {Promise<Object>} Progresso do deck
     */
    async getDeckProgress(userId, deckId) {
        try {
            // Verificar se o deck pertence ao usuário
            const deck = await Deck.findById(userId, deckId);
            if (!deck) {
                throw new Error('Deck não encontrado ou não pertence ao usuário');
            }

            // Buscar progresso do deck
            const progress = await Study.getDeckProgress(userId, deckId);

            return {
                success: true,
                deck: {
                    id: deck.id,
                    title: deck.title,
                    icon: deck.icon,
                    color: deck.color
                },
                progress: progress,
                message: `Progresso do deck "${deck.title}" carregado com sucesso`
            };
        } catch (error) {
            console.error('Erro ao buscar progresso do deck:', error);
            throw error;
        }
    }

    /**
     * Reset do progresso de um card específico
     * @param {number} userId - ID do usuário
     * @param {number} cardId - ID do card
     * @returns {Promise<Object>} Resultado da operação
     */
    async resetCardProgress(userId, cardId) {
        try {
            // Verificar se o card pertence ao usuário
            const cardExists = await this.validateCardOwnership(userId, cardId);
            if (!cardExists) {
                throw new Error('Card não encontrado ou não pertence ao usuário');
            }

            // Resetar progresso
            const success = await Study.resetProgress(userId, cardId);

            if (!success) {
                throw new Error('Falha ao resetar progresso do card');
            }

            // Buscar estatísticas atualizadas
            const updatedStats = await Study.getStudyStats(userId);

            return {
                success: true,
                cardId: cardId,
                stats: updatedStats,
                message: 'Progresso do card resetado com sucesso'
            };
        } catch (error) {
            console.error('Erro ao resetar progresso do card:', error);
            throw error;
        }
    }

    /**
     * Busca estatísticas gerais de estudo do usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Estatísticas gerais
     */
    async getGeneralStats(userId) {
        try {
            const stats = await Study.getStudyStats(userId);
            const recentReviews = await Study.getRecentReviews(userId, 5);

            return {
                success: true,
                stats: stats,
                recentReviews: recentReviews,
                message: 'Estatísticas carregadas com sucesso'
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas gerais:', error);
            throw error;
        }
    }

    /**
     * Busca cards prontos para revisão hoje
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de cards
     * @returns {Promise<Object>} Cards devido para hoje
     */
    async getCardsDueToday(userId, limit = 50) {
        try {
            const cards = await Study.getCardsForReview(userId, limit);
            const stats = await Study.getStudyStats(userId);

            return {
                success: true,
                cards: cards,
                totalDue: cards.length,
                stats: stats,
                message: `${cards.length} cards disponíveis para revisão hoje`
            };
        } catch (error) {
            console.error('Erro ao buscar cards devidos hoje:', error);
            throw error;
        }
    }

    // Métodos auxiliares privados

    /**
     * Valida se um card pertence ao usuário
     * @param {number} userId - ID do usuário
     * @param {number} cardId - ID do card
     * @returns {Promise<boolean>} Se o card pertence ao usuário
     */
    async validateCardOwnership(userId, cardId) {
        try {
            const result = await Card.belongsToUser(cardId, userId);
            return result;
        } catch (error) {
            console.error('Erro ao validar propriedade do card:', error);
            return false;
        }
    }

    /**
     * Calcula a próxima data de revisão baseada na última revisão e intervalo
     * @param {Date} lastReviewedAt - Data da última revisão
     * @param {number} interval - Intervalo em dias
     * @returns {Date} Próxima data de revisão
     */
    calculateNextReviewDate(lastReviewedAt, interval) {
        if (!lastReviewedAt) {
            return new Date(); // Se nunca foi revisado, próxima revisão é agora
        }

        const nextDate = new Date(lastReviewedAt);
        nextDate.setDate(nextDate.getDate() + interval);
        return nextDate;
    }

    /**
     * Gera mensagem de feedback baseada na dificuldade e novo intervalo
     * @param {number} difficulty - Dificuldade marcada (1-3)
     * @param {number} newInterval - Novo intervalo calculado
     * @returns {string} Mensagem de feedback
     */
    getReviewFeedbackMessage(difficulty, newInterval) {
        const messages = {
            1: {
                base: "Não desanime! A prática leva à perfeição.",
                interval: newInterval === 1 ? "Você verá este card novamente amanhã." : `Próxima revisão em ${newInterval} dias.`
            },
            2: {
                base: "Bom trabalho! Você está progredindo bem.",
                interval: `Próxima revisão em ${newInterval} ${newInterval === 1 ? 'dia' : 'dias'}.`
            },
            3: {
                base: "Excelente! Você domina este conteúdo.",
                interval: `Próxima revisão em ${newInterval} ${newInterval === 1 ? 'dia' : 'dias'}.`
            }
        };

        const message = messages[difficulty];
        return `${message.base} ${message.interval}`;
    }

    /**
     * Analisa padrões de estudo e sugere melhorias
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Análise e sugestões
     */
    async getStudyAnalysis(userId) {
        try {
            const stats = await Study.getStudyStats(userId);
            const recentReviews = await Study.getRecentReviews(userId, 20);

            const analysis = {
                overallProgress: this.calculateOverallProgress(stats),
                studyConsistency: this.analyzeStudyConsistency(recentReviews),
                difficultyDistribution: this.analyzeDifficultyDistribution(recentReviews),
                suggestions: []
            };

            // Gerar sugestões baseadas na análise
            analysis.suggestions = this.generateStudySuggestions(analysis, stats);

            return {
                success: true,
                analysis: analysis,
                message: 'Análise de estudo gerada com sucesso'
            };
        } catch (error) {
            console.error('Erro ao gerar análise de estudo:', error);
            throw error;
        }
    }

    // Métodos de análise (implementação simplificada)
    calculateOverallProgress(stats) {
        if (stats.total_cards === 0) return 0;
        return Math.round((stats.cards_learned / stats.total_cards) * 100);
    }

    analyzeStudyConsistency(recentReviews) {
        // Implementação simplificada - pode ser expandida
        const today = new Date();
        const last7Days = recentReviews.filter(review => {
            const reviewDate = new Date(review.last_reviewed_at);
            const diffTime = today - reviewDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        });

        return {
            reviewsLast7Days: last7Days.length,
            averagePerDay: Math.round(last7Days.length / 7 * 10) / 10,
            consistency: last7Days.length >= 5 ? 'Alta' : last7Days.length >= 2 ? 'Média' : 'Baixa'
        };
    }

    analyzeDifficultyDistribution(recentReviews) {
        const distribution = { 1: 0, 2: 0, 3: 0 };
        recentReviews.forEach(review => {
            if (review.last_difficulty) {
                distribution[review.last_difficulty]++;
            }
        });

        const total = distribution[1] + distribution[2] + distribution[3];
        if (total === 0) return { 1: 0, 2: 0, 3: 0, total: 0 };

        return {
            1: Math.round((distribution[1] / total) * 100),
            2: Math.round((distribution[2] / total) * 100),
            3: Math.round((distribution[3] / total) * 100),
            total: total
        };
    }

    generateStudySuggestions(analysis, stats) {
        const suggestions = [];

        if (analysis.overallProgress < 30) {
            suggestions.push({
                type: 'progress',
                message: 'Considere estudar um pouco todos os dias para acelerar seu progresso.',
                priority: 'alta'
            });
        }

        if (analysis.studyConsistency.consistency === 'Baixa') {
            suggestions.push({
                type: 'consistency',
                message: 'Tente manter uma rotina regular de estudos para melhor retenção.',
                priority: 'alta'
            });
        }

        if (stats.cards_due > 20) {
            suggestions.push({
                type: 'workload',
                message: `Você tem ${stats.cards_due} cards pendentes. Considere sessões de estudo mais longas.`,
                priority: 'média'
            });
        }

        if (analysis.difficultyDistribution[1] > 50) {
            suggestions.push({
                type: 'difficulty',
                message: 'Muitos cards marcados como difíceis. Considere revisar o material base.',
                priority: 'média'
            });
        }

        return suggestions;
    }
}

export default StudyService;

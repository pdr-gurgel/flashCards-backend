import client from './db.js';

class Study {
    /**
     * Busca ou cria um registro de estudo para um card
     * @param {number} userId - ID do usuário
     * @param {number} cardId - ID do card
     * @returns {Promise<Object>} Registro de estudo
     */
    static async findOrCreate(userId, cardId) {
        try {
            // Buscar registro existente
            let study = await this.findByUserAndCard(userId, cardId);

            if (!study) {
                // Criar novo registro
                const result = await client.query(`
                    INSERT INTO studies (user_id, card_id, interval, repetitions, ease_factor, last_reviewed_at)
                    VALUES ($1, $2, 1, 0, 2.5, NULL)
                    RETURNING *
                `, [userId, cardId]);
                study = result.rows[0];
            }

            return study;
        } catch (error) {
            console.error('Erro ao buscar/criar estudo:', error);
            throw error;
        }
    }

    /**
     * Busca cards para revisão baseado no intervalo e última revisão
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de cards (padrão: 20)
     * @param {number} deckId - ID do deck (opcional)
     * @returns {Promise<Array>} Lista de cards para revisar
     */
    static async getCardsForReview(userId, limit = 20, deckId = null) {
        try {
            let query = `
                SELECT 
                    c.id as card_id,
                    c.question,
                    c.response,
                    c.difficulty as initial_difficulty,
                    d.id as deck_id,
                    d.title as deck_title,
                    d.color as deck_color,
                    d.icon as deck_icon,
                    COALESCE(s.interval, 1) as interval,
                    COALESCE(s.repetitions, 0) as repetitions,
                    COALESCE(s.ease_factor, 2.5) as ease_factor,
                    s.last_difficulty,
                    s.last_reviewed_at,
                    CASE 
                        WHEN s.last_reviewed_at IS NULL THEN true
                        WHEN s.last_reviewed_at + INTERVAL '1 day' * COALESCE(s.interval, 1) <= NOW() THEN true
                        ELSE false
                    END as due_for_review
                FROM cards c
                JOIN decks d ON d.id = c.deck_id
                LEFT JOIN studies s ON s.card_id = c.id AND s.user_id = $1
                WHERE d.user_id = $1
            `;

            const params = [userId];

            if (deckId) {
                query += ` AND d.id = $${params.length + 1}`;
                params.push(deckId);
            }

            query += `
                AND (
                    s.last_reviewed_at IS NULL 
                    OR s.last_reviewed_at + INTERVAL '1 day' * COALESCE(s.interval, 1) <= NOW()
                )
                ORDER BY 
                    CASE WHEN s.last_reviewed_at IS NULL THEN 0 ELSE 1 END,
                    s.last_reviewed_at ASC NULLS FIRST
                LIMIT $${params.length + 1}
            `;
            params.push(limit);

            const result = await client.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar cards para revisão:', error);
            throw error;
        }
    }

    /**
     * Atualiza progresso após revisão usando algoritmo SM-2
     * @param {number} userId - ID do usuário
     * @param {number} cardId - ID do card
     * @param {number} difficulty - Dificuldade (1-3)
     * @returns {Promise<Object>} Registro atualizado
     */
    static async updateProgress(userId, cardId, difficulty) {
        try {
            // Buscar ou criar registro atual
            const currentStudy = await this.findOrCreate(userId, cardId);

            // Aplicar algoritmo SM-2
            const newData = this.calculateSM2({
                interval: currentStudy.interval,
                repetitions: currentStudy.repetitions,
                easeFactor: currentStudy.ease_factor
            }, difficulty);

            // Atualizar no banco
            const result = await client.query(`
                UPDATE studies 
                SET 
                    interval = $3,
                    repetitions = $4,
                    ease_factor = $5,
                    last_difficulty = $6,
                    last_reviewed_at = NOW()
                WHERE user_id = $1 AND card_id = $2
                RETURNING *
            `, [
                userId,
                cardId,
                newData.interval,
                newData.repetitions,
                newData.easeFactor,
                difficulty
            ]);

            return result.rows[0];
        } catch (error) {
            console.error('Erro ao atualizar progresso:', error);
            throw error;
        }
    }

    /**
     * Implementação do algoritmo SM-2 (SuperMemo-2)
     * @param {Object} currentData - Dados atuais {interval, repetitions, easeFactor}
     * @param {number} difficulty - Dificuldade (1=Difícil, 2=Médio, 3=Fácil)
     * @returns {Object} Novos dados calculados
     */
    static calculateSM2(currentData, difficulty) {
        let { interval, repetitions, easeFactor } = currentData;

        // Calcular novo ease factor
        easeFactor = easeFactor + (0.1 - (3 - difficulty) * (0.08 + (3 - difficulty) * 0.02));

        // Garantir limite mínimo do ease factor
        if (easeFactor < 1.3) easeFactor = 1.3;

        // Calcular novo intervalo baseado na dificuldade
        if (difficulty < 2) {
            // Resposta incorreta ou muito difícil - resetar progresso
            repetitions = 0;
            interval = 1;
        } else {
            // Resposta correta - incrementar repetições
            repetitions++;

            if (repetitions === 1) {
                interval = 1;
            } else if (repetitions === 2) {
                interval = 3;
            } else {
                interval = Math.round(interval * easeFactor);
            }
        }

        return {
            interval,
            repetitions,
            easeFactor: Math.round(easeFactor * 100) / 100 // Arredondar para 2 casas decimais
        };
    }

    /**
     * Busca estatísticas de estudo do usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Estatísticas gerais
     */
    static async getStudyStats(userId) {
        try {
            const result = await client.query(`
                SELECT 
                    COUNT(DISTINCT c.id) as total_cards,
                    COUNT(s.id) as total_cards_studied,
                    COUNT(CASE WHEN s.repetitions >= 2 AND s.ease_factor >= 2.0 THEN 1 END) as cards_learned,
                    COUNT(CASE 
                        WHEN s.last_reviewed_at IS NULL THEN 1
                        WHEN s.last_reviewed_at + INTERVAL '1 day' * s.interval <= NOW() THEN 1
                    END) as cards_due,
                    COALESCE(AVG(CASE WHEN s.ease_factor IS NOT NULL THEN s.ease_factor END), 2.5) as avg_ease_factor,
                    MAX(s.last_reviewed_at) as last_study_date,
                    COUNT(CASE WHEN s.last_reviewed_at::date = CURRENT_DATE THEN 1 END) as cards_studied_today
                FROM cards c
                JOIN decks d ON d.id = c.deck_id
                LEFT JOIN studies s ON s.card_id = c.id AND s.user_id = $1
                WHERE d.user_id = $1
            `, [userId]);

            const stats = result.rows[0];

            return {
                total_cards: parseInt(stats.total_cards) || 0,
                total_cards_studied: parseInt(stats.total_cards_studied) || 0,
                cards_learned: parseInt(stats.cards_learned) || 0,
                cards_due: parseInt(stats.cards_due) || 0,
                avg_ease_factor: parseFloat(stats.avg_ease_factor) || 2.5,
                last_study_date: stats.last_study_date,
                cards_studied_today: parseInt(stats.cards_studied_today) || 0
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw error;
        }
    }

    /**
     * Busca progresso detalhado de um deck específico
     * @param {number} userId - ID do usuário
     * @param {number} deckId - ID do deck
     * @returns {Promise<Object>} Progresso do deck
     */
    static async getDeckProgress(userId, deckId) {
        try {
            const result = await client.query(`
                SELECT 
                    COUNT(c.id) as total_cards,
                    COUNT(s.id) as studied_cards,
                    COUNT(CASE WHEN s.repetitions > 0 THEN 1 END) as learned_cards,
                    COUNT(CASE 
                        WHEN s.last_reviewed_at IS NULL THEN 1
                        WHEN s.last_reviewed_at + INTERVAL '1 day' * s.interval <= NOW() THEN 1
                    END) as due_cards,
                    COALESCE(AVG(s.ease_factor), 2.5) as avg_ease_factor,
                    MAX(s.last_reviewed_at) as last_study_date
                FROM cards c
                LEFT JOIN studies s ON s.card_id = c.id AND s.user_id = $1
                WHERE c.deck_id = $2
            `, [userId, deckId]);

            const progress = result.rows[0];

            return {
                total_cards: parseInt(progress.total_cards) || 0,
                studied_cards: parseInt(progress.studied_cards) || 0,
                learned_cards: parseInt(progress.learned_cards) || 0,
                due_cards: parseInt(progress.due_cards) || 0,
                avg_ease_factor: parseFloat(progress.avg_ease_factor) || 2.5,
                last_study_date: progress.last_study_date,
                completion_rate: progress.total_cards > 0
                    ? Math.round((progress.learned_cards / progress.total_cards) * 100)
                    : 0
            };
        } catch (error) {
            console.error('Erro ao buscar progresso do deck:', error);
            throw error;
        }
    }

    /**
     * Reset progresso de um card específico
     * @param {number} userId - ID do usuário
     * @param {number} cardId - ID do card
     * @returns {Promise<boolean>} Sucesso da operação
     */
    static async resetProgress(userId, cardId) {
        try {
            // Primeiro verificar se o card pertence ao usuário
            const cardCheck = await client.query(`
                SELECT c.id 
                FROM cards c
                JOIN decks d ON d.id = c.deck_id
                WHERE c.id = $1 AND d.user_id = $2
            `, [cardId, userId]);

            if (cardCheck.rows.length === 0) {
                throw new Error('Card não encontrado ou não pertence ao usuário');
            }

            // Resetar ou criar registro de estudo
            const result = await client.query(`
                INSERT INTO studies (user_id, card_id, interval, repetitions, ease_factor, last_difficulty, last_reviewed_at)
                VALUES ($1, $2, 1, 0, 2.5, NULL, NULL)
                ON CONFLICT (user_id, card_id) 
                DO UPDATE SET 
                    interval = 1,
                    repetitions = 0,
                    ease_factor = 2.5,
                    last_difficulty = NULL,
                    last_reviewed_at = NULL
                RETURNING *
            `, [userId, cardId]);

            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao resetar progresso:', error);
            throw error;
        }
    }

    /**
     * Busca histórico de revisões recentes
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de resultados
     * @returns {Promise<Array>} Histórico de revisões
     */
    static async getRecentReviews(userId, limit = 10) {
        try {
            const result = await client.query(`
                SELECT 
                    c.id as card_id,
                    c.question,
                    c.response,
                    d.title as deck_title,
                    d.color as deck_color,
                    s.last_difficulty,
                    s.last_reviewed_at,
                    s.interval,
                    s.repetitions
                FROM studies s
                JOIN cards c ON c.id = s.card_id
                JOIN decks d ON d.id = c.deck_id
                WHERE s.user_id = $1 
                    AND s.last_reviewed_at IS NOT NULL
                ORDER BY s.last_reviewed_at DESC
                LIMIT $2
            `, [userId, limit]);

            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar revisões recentes:', error);
            throw error;
        }
    }

    // Métodos auxiliares
    static async findByUserAndCard(userId, cardId) {
        try {
            const result = await client.query(
                'SELECT * FROM studies WHERE user_id = $1 AND card_id = $2',
                [userId, cardId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar estudo por usuário e card:', error);
            throw error;
        }
    }

    /**
     * Verifica se existe um registro único de user_id + card_id
     * @param {number} userId - ID do usuário
     * @param {number} cardId - ID do card
     * @returns {Promise<boolean>} Se existe registro
     */
    static async exists(userId, cardId) {
        try {
            const result = await client.query(
                'SELECT 1 FROM studies WHERE user_id = $1 AND card_id = $2',
                [userId, cardId]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar existência do estudo:', error);
            throw error;
        }
    }
}

export default Study;

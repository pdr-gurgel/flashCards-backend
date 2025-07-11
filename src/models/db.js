import { Pool } from 'pg';
import config from '../config/index.js';

const pool = new Pool({
    connectionString: config.database.url,
    max: 20,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('🔍 Database pool conectado com sucesso');
});

pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool de conexões PostgreSQL', err);
});

/**
 * Executa uma query SQL com valores parametrizados
 * @param {string} text - Query SQL
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<QueryResult>} Resultado da query
 */
export async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`Execução da query: ${duration}ms | Linhas: ${res.rowCount}`);
        return res;
    } catch (error) {
        console.error('Erro ao executar query:', { text, error });
        throw error;
    }
}

export default {
    query,
    pool
};
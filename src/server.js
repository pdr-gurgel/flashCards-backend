import Fastify from 'fastify';
import userRoutes from './routes/user.js';
import authRoutes from './routes/auth.js';
import cors from '@fastify/cors';
import config from './config/index.js';
import dotenv from 'dotenv';
import deckRoutes from './routes/deck.js';
import cardRoutes from './routes/card.js';
dotenv.config();
const fastify = Fastify({ logger: true });

// Configuração CORS para permitir requisições do frontend
fastify.register(cors, config.cors);

// Hook para responder requisições preflight OPTIONS
fastify.addHook('preHandler', (request, reply, done) => {
  if (request.method === 'OPTIONS') {
    reply.send();
    return;
  }
  done();
});

// Rota de health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Rotas
fastify.register(userRoutes);
fastify.register(authRoutes);
fastify.register(deckRoutes);
fastify.register(cardRoutes);

fastify.listen({ port: config.server.port, host: config.server.host }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor rodando em ${address}`);
});

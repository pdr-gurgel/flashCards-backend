import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import userRoutes from './routes/user.js';
import authRoutes from './routes/auth.js';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

// Configuração CORS para permitir requisições do frontend
fastify.register(cors, {
  origin: true, // Permite todas as origens em ambiente de desenvolvimento
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Hook para responder requisições preflight OPTIONS
fastify.addHook('preHandler', (request, reply, done) => {
  if (request.method === 'OPTIONS') {
    reply.send();
    return;
  }
  done();
});

// Rotas
fastify.register(userRoutes);
fastify.register(authRoutes);

const PORT = process.env.PORT || 3001;

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor rodando em ${address}`);
});

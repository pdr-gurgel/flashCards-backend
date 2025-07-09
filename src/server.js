import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import userRoutes from './routes/user.js';

const fastify = Fastify({ logger: true });
// Rotas
fastify.register(userRoutes);

const PORT = process.env.PORT || 3001;

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Servidor rodando em ${address}`);
});

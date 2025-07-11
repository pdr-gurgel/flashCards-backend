import dotenv from 'dotenv';
dotenv.config();

export default {
  server: {
    port: process.env.PORT || 3001,
    host: '0.0.0.0'
  },
  database: {
    url: process.env.SUPABASE_DB_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'changeme',
    expiresIn: '1h'
  },
  cors: {
    origin: true, // Em produção, defina para o domínio específico do frontend
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

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
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  }
};

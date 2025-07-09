import dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config();

const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL
});

await client.connect();

export default client;
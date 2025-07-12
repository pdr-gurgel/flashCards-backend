import config from '../config/index.js';
import { Pool } from 'pg';

const client = new Pool({
    connectionString: config.database.url,
    max: 20,
    idleTimeoutMillis: 20000,
    ssl: {
        rejectUnauthorized: false
    }
});

await client.connect();

export default client;
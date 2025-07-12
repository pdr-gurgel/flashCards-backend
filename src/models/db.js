import config from '../config/index.js';
import { Client } from 'pg';

const client = new Client({
    connectionString: config.database.url
});

await client.connect();

export default client;
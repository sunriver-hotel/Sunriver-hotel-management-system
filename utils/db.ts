import { createPool } from '@vercel/postgres';

// This file configures the database connection for the application.
// To connect to a Neon database, you need to set the `POSTGRES_URL`
// environment variable to your Neon connection string.
//
// The connection string format for Neon is:
// postgresql://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require
//
// You can find your connection string in your Neon project dashboard.

if (!process.env.POSTGRES_URL) {
    // In a local development environment, you might want to use a .env file
    // to load this variable. For production, this should be set in your
    // hosting provider's environment variable settings.
    throw new Error('The POSTGRES_URL environment variable is not set. Please provide your Neon database connection string.');
}

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// `db` is the connection pool, useful for transactions.
export const db = pool;

// `sql` is a template tag function for one-off queries.
export const sql = pool.sql;

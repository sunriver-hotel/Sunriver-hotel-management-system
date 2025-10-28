
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPool } from '@vercel/postgres';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  // 1. Check if the environment variable is set
  if (!process.env.POSTGRES_URL) {
    return res.status(500).json({ 
      error: 'Configuration Error',
      message: 'The POSTGRES_URL environment variable is not set on the server. Please configure it in your Vercel project settings and redeploy.' 
    });
  }
  
  // 2. Try to connect to the database
  try {
    const pool = createPool({ connectionString: process.env.POSTGRES_URL });
    await pool.sql`SELECT NOW();`;
    // If we get here, the connection is successful
    return res.status(200).json({ status: 'ok', message: 'Successfully connected to the database.' });
  } catch (error) {
    // If the connection fails
    const errorMessage = error instanceof Error ? error.message : 'An unknown database error occurred.';
    return res.status(500).json({ 
      error: 'Database Connection Error', 
      message: 'Server failed to connect to the database. Please verify your POSTGRES_URL connection string is correct and that your database is accessible.',
      details: errorMessage
    });
  }
}

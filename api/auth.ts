import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const { rows } = await sql`
      SELECT * FROM Users WHERE username = ${username};
    `;
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    // Per the database schema, the password is not hashed.
    // In a production environment, you should use a library like bcrypt to compare hashed passwords.
    if (user.password_hash === password) {
      // In a real application, you would generate and return a JWT or set a session cookie here.
      return res.status(200).json({ success: true, message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown database error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
}

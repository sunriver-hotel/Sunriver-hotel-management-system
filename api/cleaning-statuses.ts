import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../utils/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT
          room_id as "roomId",
          status,
          last_updated as "lastUpdated"
        FROM Cleaning_Statuses;
      `;
      return res.status(200).json(rows);

    } else if (req.method === 'PUT') {
      const { roomId, status } = req.body;
      if (!roomId || !status) {
        return res.status(400).json({ message: 'Room ID and status are required.' });
      }
      
      const { rows } = await sql`
        UPDATE Cleaning_Statuses
        SET status = ${status}, last_updated = NOW()
        WHERE room_id = ${roomId}
        RETURNING room_id as "roomId", status, last_updated as "lastUpdated";
      `;

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Room not found.' });
      }

      return res.status(200).json(rows[0]);

    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown database error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
}

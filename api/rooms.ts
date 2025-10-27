import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
     const { rows: rooms } = await sql`
      SELECT 
        room_id as "id",
        room_number as "number",
        room_type as "type",
        bed_type as "bedType",
        floor
      FROM Rooms
      ORDER BY room_id;
    `;
    return res.status(200).json(rooms);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown database error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
}
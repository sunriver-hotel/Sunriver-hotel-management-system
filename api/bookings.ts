import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '@vercel/postgres';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
    const client = await db.connect();
    try {
        if (req.method === 'GET') {
            const { rows } = await client.sql`
                SELECT
                    b.booking_id as "id",
                    b.customer_id as "customerId",
                    b.room_id as "roomId",
                    b.check_in_date as "checkInDate",
                    b.check_out_date as "checkOutDate",
                    b.status,
                    b.price_per_night as "pricePerNight",
                    b.deposit,
                    b.created_at as "createdAt",
                    c.customer_name as "customerName",
                    c.phone,
                    c.email,
                    c.address,
                    c.tax_id as "taxId"
                FROM Bookings b
                JOIN Customers c ON b.customer_id = c.customer_id
                ORDER BY b.created_at DESC;
            `;
            return res.status(200).json(rows);
        }
        else if (req.method === 'POST') {
            await client.query('BEGIN');
            const { customerName, phone, email, address, taxId, ...bookingData } = req.body;
            
            let customerResult = await client.sql`SELECT customer_id FROM Customers WHERE phone = ${phone};`;
            let customerId;

            if (customerResult.rows.length > 0) {
                customerId = customerResult.rows[0].customer_id;
                // Optionally update customer info if they already exist
                 await client.sql`
                    UPDATE Customers SET customer_name = ${customerName}, email = ${email || null}, address = ${address || null}, tax_id = ${taxId || null}
                    WHERE customer_id = ${customerId};
                `;
            } else {
                customerResult = await client.sql`
                    INSERT INTO Customers (customer_name, phone, email, address, tax_id)
                    VALUES (${customerName}, ${phone}, ${email || null}, ${address || null}, ${taxId || null})
                    RETURNING customer_id;
                `;
                customerId = customerResult.rows[0].customer_id;
            }

            const dateStr = bookingData.checkInDate.replace(/-/g, '');
            const uniquePart = Math.random().toString(36).substring(2, 7).toUpperCase();
            const bookingId = `SRH-${dateStr}-${uniquePart}`;
            
            const { roomId, checkInDate, checkOutDate, status, pricePerNight, deposit } = bookingData;
            const newBookingResult = await client.sql`
                INSERT INTO Bookings (booking_id, customer_id, room_id, check_in_date, check_out_date, status, price_per_night, deposit)
                VALUES (${bookingId}, ${customerId}, ${roomId}, ${checkInDate}, ${checkOutDate}, ${status}, ${pricePerNight}, ${deposit})
                RETURNING booking_id, created_at;
            `;

            await client.query('COMMIT');

            return res.status(201).json({ id: newBookingResult.rows[0].booking_id });

        } else if (req.method === 'PUT') {
            await client.query('BEGIN');
            const bookingId = req.query.id as string;
            const { customerName, phone, email, address, taxId, customerId, ...bookingData } = req.body;
            
            await client.sql`
                UPDATE Customers
                SET customer_name = ${customerName}, phone = ${phone}, email = ${email || null}, address = ${address || null}, tax_id = ${taxId || null}
                WHERE customer_id = ${customerId};
            `;
            
            const { roomId, checkInDate, checkOutDate, status, pricePerNight, deposit } = bookingData;
            await client.sql`
                UPDATE Bookings
                SET room_id = ${roomId}, check_in_date = ${checkInDate}, check_out_date = ${checkOutDate}, status = ${status}, price_per_night = ${pricePerNight}, deposit = ${deposit}
                WHERE booking_id = ${bookingId};
            `;

            await client.query('COMMIT');

            return res.status(200).json({ success: true, id: bookingId });
        }
        else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch(e) {
        await client.query('ROLLBACK');
        const errorMessage = e instanceof Error ? e.message : 'An unknown database error occurred.';
        return res.status(500).json({ error: errorMessage });
    } finally {
        client.release();
    }
}

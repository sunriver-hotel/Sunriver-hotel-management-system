import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../utils/db';

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
                    TO_CHAR(b.check_in_date, 'YYYY-MM-DD') as "checkInDate",
                    TO_CHAR(b.check_out_date, 'YYYY-MM-DD') as "checkOutDate",
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
            const { 
                customerName, phone, email, address, taxId, 
                roomId, checkInDate, checkOutDate, status, pricePerNight, deposit 
            } = req.body;

            // Generate a unique booking ID in the format SRH-YYYYMMDD-XXXXXX
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            const bookingId = `SRH-${yyyy}${mm}${dd}-${randomPart}`;

            // 1. Insert customer
            const customerResult = await client.sql`
                INSERT INTO Customers (customer_name, phone, email, address, tax_id)
                VALUES (${customerName}, ${phone}, ${email || null}, ${address || null}, ${taxId || null})
                RETURNING customer_id;
            `;
            const customerId = customerResult.rows[0].customer_id;

            // 2. Insert booking with the generated ID
            await client.sql`
                INSERT INTO Bookings (booking_id, customer_id, room_id, check_in_date, check_out_date, status, price_per_night, deposit)
                VALUES (${bookingId}, ${customerId}, ${roomId}, ${checkInDate}, ${checkOutDate}, ${status}, ${pricePerNight}, ${deposit});
            `;
            
            await client.query('COMMIT');

            return res.status(201).json({ id: bookingId, message: 'Booking created successfully' });

        } else if (req.method === 'PUT') {
            await client.query('BEGIN');
            const { id } = req.query;
            const { 
                customerName, phone, email, address, taxId, 
                roomId, checkInDate, checkOutDate, status, pricePerNight, deposit, customerId
            } = req.body;

            if (!id || !customerId) {
                return res.status(400).json({ message: 'Booking ID and Customer ID are required' });
            }

            // 1. Update customer details
            await client.sql`
                UPDATE Customers
                SET 
                    customer_name = ${customerName},
                    phone = ${phone},
                    email = ${email || null},
                    address = ${address || null},
                    tax_id = ${taxId || null}
                WHERE customer_id = ${customerId};
            `;

            // 2. Update booking details
            const { rows } = await client.sql`
                UPDATE Bookings
                SET
                    room_id = ${roomId},
                    check_in_date = ${checkInDate},
                    check_out_date = ${checkOutDate},
                    status = ${status},
                    price_per_night = ${pricePerNight},
                    deposit = ${deposit}
                WHERE booking_id = ${id as string}
                RETURNING booking_id as "id";
            `;

            if (rows.length === 0) {
                 await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Booking not found.' });
            }

            await client.query('COMMIT');

            return res.status(200).json(rows[0]);
        }
        else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        await client.query('ROLLBACK');
        const errorMessage = error instanceof Error ? error.message : 'An unknown database error occurred.';
        return res.status(500).json({ error: errorMessage });
    } finally {
        client.release();
    }
}
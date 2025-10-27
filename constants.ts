
import type { Room, Booking, CleaningStatus } from './types';
import { addDays, formatISO } from 'date-fns';

// FIX: Manually sort the rooms array by ID and remove the .sort() call to prevent type inference issues.
export const ROOMS: Room[] = [
  { id: 100, number: '100', type: 'Cottage', bedType: 'Double bed' },
  { id: 101, number: '101', type: 'Standard view', bedType: 'Double bed' },
  { id: 102, number: '102', type: 'River view', bedType: 'Double bed' },
  { id: 103, number: '103', type: 'Standard view', bedType: 'Double bed' },
  { id: 104, number: '104', type: 'River view', bedType: 'Double bed' },
  { id: 105, number: '105', type: 'Standard view', bedType: 'Double bed' },
  { id: 201, number: '201', type: 'Standard view', bedType: 'Twin bed' },
  { id: 203, number: '203', type: 'Standard view', bedType: 'Twin bed' },
  { id: 205, number: '205', type: 'Standard view', bedType: 'Double bed' },
  { id: 206, number: '206', type: 'River view', bedType: 'Double bed' },
  { id: 208, number: '208', type: 'River view', bedType: 'Double bed' },
  { id: 209, number: '209', type: 'Standard view', bedType: 'Double bed' },
  { id: 210, number: '210', type: 'River view', bedType: 'Double bed' },
  { id: 212, number: '212', type: 'River view', bedType: 'Double bed' },
  { id: 301, number: '301', type: 'Standard view', bedType: 'Twin bed' },
  { id: 302, number: '302', type: 'River view', bedType: 'Double bed' },
  { id: 303, number: '303', type: 'Standard view', bedType: 'Twin bed' },
  { id: 304, number: '304', type: 'River view', bedType: 'Double bed' },
  { id: 305, number: '305', type: 'Standard view', bedType: 'Double bed' },
  { id: 306, number: '306', type: 'River view', bedType: 'Double bed' },
  { id: 308, number: '308', type: 'River view', bedType: 'Double bed' },
  { id: 309, number: '309', type: 'Standard view', bedType: 'Double bed' },
  { id: 310, number: '310', type: 'River view', bedType: 'Double bed' },
  { id: 312, number: '312', type: 'River view', bedType: 'Double bed' },
];

const today = new Date();
export const INITIAL_BOOKINGS: Booking[] = [
  { id: `SRH-${formatISO(today, { representation: 'date' }).replace(/-/g, '')}-001`, customerName: 'John Doe', phone: '0812345678', checkInDate: formatISO(today, { representation: 'date' }), checkOutDate: formatISO(addDays(today, 2), { representation: 'date' }), roomId: 102, status: 'Paid', deposit: 0, pricePerNight: 800, createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { id: `SRH-${formatISO(addDays(today, 1), { representation: 'date' }).replace(/-/g, '')}-001`, customerName: 'Jane Smith', phone: '0823456789', checkInDate: formatISO(addDays(today, 1), { representation: 'date' }), checkOutDate: formatISO(addDays(today, 3), { representation: 'date' }), roomId: 206, status: 'Deposit', deposit: 500, pricePerNight: 800, createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 },
  { id: `SRH-${formatISO(addDays(today, -2), { representation: 'date' }).replace(/-/g, '')}-001`, customerName: 'Peter Pan', phone: '0834567890', checkInDate: formatISO(addDays(today, -2), { representation: 'date' }), checkOutDate: formatISO(addDays(today, 1), { representation: 'date' }), roomId: 301, status: 'Unpaid', deposit: 0, pricePerNight: 800, createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  { id: `SRH-${formatISO(today, { representation: 'date' }).replace(/-/g, '')}-002`, customerName: 'Alice Wonderland', phone: '0845678901', checkInDate: formatISO(today, { representation: 'date' }), checkOutDate: formatISO(addDays(today, 1), { representation: 'date' }), roomId: 100, status: 'Paid', deposit: 0, pricePerNight: 1200, createdAt: Date.now() },
];

export const INITIAL_CLEANING_STATUSES: CleaningStatus[] = ROOMS.map(room => ({
  roomId: room.id,
  status: 'Clean',
  lastUpdated: Date.now(),
}));

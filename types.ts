export type RoomType = 'River view' | 'Standard view' | 'Cottage';
export type BedType = 'Double bed' | 'Twin bed';
export type BookingStatus = 'Paid' | 'Deposit' | 'Unpaid';
export type CleaningStatusValue = 'Clean' | 'Needs Cleaning';

export interface Room {
  id: number;
  number: string;
  type: RoomType;
  bedType: BedType;
  floor: number;
}

export interface Booking {
  id: string;
  customerId: number;
  roomId: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  status: BookingStatus;
  pricePerNight: number;
  deposit: number;
  createdAt: string; // ISO String from timestamp
  // For easier frontend use, these are flattened from a joined query
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  taxId?: string;
}


export interface CleaningStatus {
  roomId: number;
  status: CleaningStatusValue;
  lastUpdated: string;
}

export type Language = 'en' | 'th';

export interface Translations {
  [key: string]: {
    [key: string]: string | { [key: string]: string };
  };
}
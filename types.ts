
export type RoomType = 'River view' | 'Standard view' | 'Cottage';
export type BedType = 'Double bed' | 'Twin bed';
export type BookingStatus = 'Paid' | 'Deposit' | 'Unpaid';
export type CleaningStatusValue = 'Clean' | 'Needs Cleaning';

export interface Room {
  id: number;
  number: string;
  type: RoomType;
  bedType: BedType;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  roomId: number;
  status: BookingStatus;
  deposit: number;
  pricePerNight: number;
  email?: string;
  address?: string;
  taxId?: string;
  createdAt: number; // timestamp
}

export interface CleaningStatus {
  roomId: number;
  status: CleaningStatusValue;
  lastUpdated: number;
}

export type Language = 'en' | 'th';

export interface Translations {
  [key: string]: {
    [key: string]: string | { [key: string]: string };
  };
}

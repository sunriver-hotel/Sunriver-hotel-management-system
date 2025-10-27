import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Booking, CleaningStatus, CleaningStatusValue, Room } from '../types';
import { isSameDay, parseISO, isWithinInterval } from 'date-fns';

// Helper function to fetch data from the API
async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

interface AppContextType {
  rooms: Room[];
  bookings: Booking[];
  cleaningStatuses: CleaningStatus[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'customerId'>) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  updateCleaningStatus: (roomId: number, status: CleaningStatusValue) => Promise<void>;
  getBookingsForDate: (date: Date) => Booking[];
  getRoomStatusForDate: (roomId: number, date: Date) => 'Booked' | 'Vacant';
  loading: boolean;
  error: string | null;
  reloadData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cleaningStatuses, setCleaningStatuses] = useState<CleaningStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reloadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsData, bookingsData, cleaningStatusesData] = await Promise.all([
        fetchData<Room[]>('/api/rooms'),
        fetchData<Booking[]>('/api/bookings'),
        fetchData<CleaningStatus[]>('/api/cleaning-statuses')
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
      setCleaningStatuses(cleaningStatusesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);
  
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'customerId'>) => {
    try {
      await fetchData<Booking>('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      await reloadData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateBooking = async (updatedBooking: Booking) => {
    try {
        await fetchData<Booking>(`/api/bookings?id=${updatedBooking.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBooking),
        });
        await reloadData();
    } catch (err: any) {
        setError(err.message);
        throw err;
    }
  };

  const updateCleaningStatus = async (roomId: number, status: CleaningStatusValue) => {
    try {
        const updatedStatus = await fetchData<CleaningStatus>(`/api/cleaning-statuses`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, status }),
        });
        setCleaningStatuses(prev => prev.map(cs => 
            cs.roomId === roomId ? { ...cs, status: updatedStatus.status, lastUpdated: updatedStatus.lastUpdated } : cs
        ));
    } catch (err:any) {
        setError(err.message);
        throw err;
    }
  };

  const getBookingsForDate = useCallback((date: Date): Booking[] => {
    return bookings.filter(booking => {
      const checkIn = parseISO(booking.checkInDate);
      const checkOut = parseISO(booking.checkOutDate);
      return date >= checkIn && date < checkOut;
    });
  }, [bookings]);

  const getRoomStatusForDate = useCallback((roomId: number, date: Date): 'Booked' | 'Vacant' => {
      const isBooked = bookings.some(booking => {
          if (booking.roomId !== roomId) return false;
          const checkIn = parseISO(booking.checkInDate);
          const checkOut = parseISO(booking.checkOutDate);
          return date >= checkIn && date < checkOut;
      });
      return isBooked ? 'Booked' : 'Vacant';
  }, [bookings]);

  return (
    <AppContext.Provider value={{ rooms, bookings, cleaningStatuses, addBooking, updateBooking, updateCleaningStatus, getBookingsForDate, getRoomStatusForDate, loading, error, reloadData }}>
      {children}
    </AppContext.Provider>
  );
};

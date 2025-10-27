
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Booking, CleaningStatus, Room } from '../types';
import { ROOMS, INITIAL_BOOKINGS, INITIAL_CLEANING_STATUSES } from '../constants';
import { isSameDay, isBefore, parseISO, startOfToday, endOfToday, endOfDay, isWithinInterval } from 'date-fns';

interface AppContextType {
  rooms: Room[];
  bookings: Booking[];
  cleaningStatuses: CleaningStatus[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (booking: Booking) => void;
  updateCleaningStatus: (roomId: number, status: 'Clean' | 'Needs Cleaning') => void;
  getBookingsForDate: (date: Date) => Booking[];
  getRoomStatusForDate: (roomId: number, date: Date) => 'Booked' | 'Vacant';
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const savedBookings = localStorage.getItem('bookings');
    return savedBookings ? JSON.parse(savedBookings) : INITIAL_BOOKINGS;
  });

  const [cleaningStatuses, setCleaningStatuses] = useState<CleaningStatus[]>(() => {
    const savedStatuses = localStorage.getItem('cleaningStatuses');
    return savedStatuses ? JSON.parse(savedStatuses) : INITIAL_CLEANING_STATUSES;
  });

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('cleaningStatuses', JSON.stringify(cleaningStatuses));
  }, [cleaningStatuses]);
  
  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const dateStr = bookingData.checkInDate.replace(/-/g, '');
    const newId = `SRH-${dateStr}-${String(Date.now()).slice(-4)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdAt: Date.now(),
    };
    setBookings(prev => [...prev, newBooking]);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
  };

  const updateCleaningStatus = (roomId: number, status: 'Clean' | 'Needs Cleaning') => {
    setCleaningStatuses(prev => prev.map(cs => 
      cs.roomId === roomId ? { ...cs, status, lastUpdated: Date.now() } : cs
    ));
  };

  const getBookingsForDate = useCallback((date: Date): Booking[] => {
    return bookings.filter(booking => {
      const checkIn = parseISO(booking.checkInDate);
      const checkOut = parseISO(booking.checkOutDate);
      return isWithinInterval(date, { start: checkIn, end: endOfDay(checkOut) }) && !isSameDay(date, checkOut);
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

  const runDailyCleaningUpdate = useCallback(() => {
    const today = startOfToday();
    const occupiedRoomIds = new Set<number>();

    bookings.forEach(booking => {
        const checkIn = parseISO(booking.checkInDate);
        const checkOut = parseISO(booking.checkOutDate);
        if (today >= checkIn && today < checkOut) {
            occupiedRoomIds.add(booking.roomId);
        }
    });
    
    setCleaningStatuses(prevStatuses =>
        prevStatuses.map(cs =>
            occupiedRoomIds.has(cs.roomId)
                ? { ...cs, status: 'Needs Cleaning', lastUpdated: Date.now() }
                : cs
        )
    );
  }, [bookings]);
  
  useEffect(() => {
    const now = new Date();
    const endOfTodayMs = endOfToday().getTime();
    const msUntilMidnight = endOfTodayMs - now.getTime() + 1000; // a second after midnight

    const timerId = setTimeout(() => {
        runDailyCleaningUpdate();
        const intervalId = setInterval(runDailyCleaningUpdate, 24 * 60 * 60 * 1000); // every 24 hours
        return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timerId);
  }, [runDailyCleaningUpdate]);

  return (
    <AppContext.Provider value={{ rooms: ROOMS, bookings, cleaningStatuses, addBooking, updateBooking, updateCleaningStatus, getBookingsForDate, getRoomStatusForDate }}>
      {children}
    </AppContext.Provider>
  );
};

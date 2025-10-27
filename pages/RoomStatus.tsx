
import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '../hooks/useAppContext';
import { useLanguage } from '../hooks/useLanguage';
import type { Room } from '../types';
import BookingForm from '../components/BookingForm';

interface RoomStatusPageProps {
  onNavigateToBooking: (page: 'Home') => void;
}

type SortKey = 'roomNumber' | 'roomType' | 'bedType';

const RoomStatusPage: React.FC<RoomStatusPageProps> = ({ onNavigateToBooking }) => {
  const { rooms, getRoomStatusForDate, loading, error } = useAppContext();
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortKey, setSortKey] = useState<SortKey>('roomNumber');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(parseISO(e.target.value));
  };

  const handleBookNow = (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsModalOpen(true);
  };
  
  const sortedRooms = useMemo(() => {
    const roomsCopy = [...rooms];
    roomsCopy.sort((a, b) => {
      if (sortKey === 'roomNumber') return a.id - b.id;
      if (sortKey === 'roomType') return a.type.localeCompare(b.type);
      if (sortKey === 'bedType') return a.bedType.localeCompare(b.bedType);
      return 0;
    });
    return roomsCopy;
  }, [rooms, sortKey]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sunriver-blue">{t('roomStatus.title')}</h1>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="date-picker" className="font-semibold">{t('roomStatus.selectDate')}:</label>
          <input
            id="date-picker"
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            className="border-gray-300 rounded-md shadow-sm focus:border-sunriver-yellow focus:ring-sunriver-yellow"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="font-semibold">{t('roomStatus.sortBy')}:</label>
          <select
            id="sort-by"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="border-gray-300 rounded-md shadow-sm focus:border-sunriver-yellow focus:ring-sunriver-yellow"
          >
            <option value="roomNumber">{t('roomStatus.roomNumber')}</option>
            <option value="roomType">{t('roomStatus.roomType')}</option>
            <option value="bedType">{t('roomStatus.bedType')}</option>
          </select>
        </div>
      </div>

      {loading && <div className="flex justify-center items-center p-8"><i className="fas fa-spinner fa-spin text-2xl text-sunriver-yellow"></i><span className="ml-2">Loading Rooms...</span></div>}
      {error && <div className="text-center p-8 text-red-500 bg-red-100 rounded-lg"><strong>Error:</strong> {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sortedRooms.map((room) => {
            const status = getRoomStatusForDate(room.id, selectedDate);
            return (
              <div
                key={room.id}
                className={`p-4 rounded-lg shadow-md text-center flex flex-col justify-between transition-all duration-300 ${
                  status === 'Booked' ? 'bg-pastel-red/50' : 'bg-pastel-green/50'
                }`}
              >
                <div>
                  <p className="text-2xl font-bold text-sunriver-blue">{room.number}</p>
                  <p className="text-sm text-gray-600">{room.type}</p>
                  <p className="text-xs text-gray-500">{room.bedType}</p>
                </div>
                <div className="mt-4">
                  {status === 'Vacant' ? (
                    <button onClick={() => handleBookNow(room.id)} className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-full hover:bg-green-600 transition-colors">
                      {t('roomStatus.bookNow')}
                    </button>
                  ) : (
                    <p className="text-red-700 font-semibold">{t('home.booked')}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <BookingForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultDate={selectedDate}
          defaultRoomId={selectedRoomId}
        />
      )}
    </div>
  );
};

export default RoomStatusPage;

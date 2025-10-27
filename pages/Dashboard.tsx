import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLanguage } from '../hooks/useLanguage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { eachDayOfInterval, format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, parseISO } from 'date-fns';

type Period = 'daily' | 'monthly' | 'yearly';

const DashboardPage: React.FC = () => {
  const { rooms, bookings, loading, error } = useAppContext();
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>('daily');

  const occupancyData = useMemo(() => {
    if (!bookings || bookings.length === 0 || rooms.length === 0) return [];
    const today = new Date();
    if (period === 'daily') {
      const days = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
      return days.map(day => {
        const bookedCount = bookings.filter(b => {
            const checkIn = parseISO(b.checkInDate);
            const checkOut = parseISO(b.checkOutDate);
            return day >= checkIn && day < checkOut;
        }).length;
        return {
          name: format(day, 'd'),
          [t('dashboard.occupancyRate')]: (bookedCount / rooms.length) * 100,
        };
      });
    }
    if (period === 'monthly') {
      const months = eachMonthOfInterval({ start: startOfYear(today), end: endOfYear(today) });
      return months.map(month => {
          const daysInMonth = eachDayOfInterval({start: startOfMonth(month), end: endOfMonth(month)});
          let totalBookedNights = 0;
          daysInMonth.forEach(day => {
            totalBookedNights += bookings.filter(b => {
                const checkIn = parseISO(b.checkInDate);
                const checkOut = parseISO(b.checkOutDate);
                return day >= checkIn && day < checkOut;
            }).length;
          });

        return {
          name: format(month, 'MMM'),
          [t('dashboard.occupancyRate')]: (totalBookedNights / (daysInMonth.length * rooms.length)) * 100,
        };
      });
    }
    // Yearly data is a bit broad, so we'll show monthly for current year as 'yearly' view
    return []; // Yearly could be implemented for multiple years if data was available
  }, [period, bookings, rooms.length, t]);

  const mostBookedRoomsData = useMemo(() => {
    if (!bookings || bookings.length === 0 || rooms.length === 0) return [];
    const roomCounts: { [key: number]: number } = {};
    bookings.forEach(booking => {
      roomCounts[booking.roomId] = (roomCounts[booking.roomId] || 0) + 1;
    });
    return Object.entries(roomCounts)
      .map(([roomId, count]) => ({
        name: rooms.find(r => r.id === parseInt(roomId))?.number || `Room ${roomId}`,
        [t('dashboard.bookings')]: count,
      }))
      .sort((a, b) => (b[t('dashboard.bookings')] as number) - (a[t('dashboard.bookings')] as number))
      .slice(0, 10);
  }, [bookings, rooms, t]);

  const PeriodButton:React.FC<{p:Period, label:string}> = ({ p, label }) => (
    <button
        onClick={() => setPeriod(p)}
        className={`px-4 py-2 rounded-md text-sm font-medium ${period === p ? 'bg-sunriver-yellow text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
        {label}
    </button>
  );


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-sunriver-blue">{t('dashboard.title')}</h1>
      
      {loading && <div className="flex justify-center items-center p-8"><i className="fas fa-spinner fa-spin text-2xl text-sunriver-yellow"></i><span className="ml-2">Loading Dashboard...</span></div>}
      {error && <div className="text-center p-8 text-red-500 bg-red-100 rounded-lg"><strong>Error:</strong> {error}</div>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('dashboard.occupancyStatistics')}</h2>
              <div className="flex space-x-2">
                <PeriodButton p="daily" label={t('dashboard.daily')} />
                <PeriodButton p="monthly" label={t('dashboard.monthly')} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Legend />
                <Line type="monotone" dataKey={t('dashboard.occupancyRate')} stroke="#e6c872" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t('dashboard.mostBookedRooms')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mostBookedRoomsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey={t('dashboard.bookings')} fill="#a8d8c9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
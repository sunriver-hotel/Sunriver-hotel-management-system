
import React, { useState } from 'react';
import { format, addMonths, subMonths, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';
// FIX: Import locales using ES module syntax instead of require.
import { th } from 'date-fns/locale/th';
import { enUS } from 'date-fns/locale/en-US';
import { useAppContext } from '../hooks/useAppContext';
import { useLanguage } from '../hooks/useLanguage';
import { getCalendarDays } from '../utils/dateUtils';
import BookingForm from '../components/BookingForm';
import type { Booking } from '../types';

const HomePage: React.FC = () => {
    const { rooms, bookings, getBookingsForDate } = useAppContext();
    const { t, language } = useLanguage();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [activeSummaryTab, setActiveSummaryTab] = useState<'checkIn' | 'checkOut' | 'inHouse'>('checkIn');
    const [summaryDate, setSummaryDate] = useState(new Date());

    const calendarDays = getCalendarDays(currentMonth);
    const weekdays = language === 'th'
        ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDateClick = (day: Date) => {
        setSelectedDate(day);
        setEditingBooking(null);
        setIsModalOpen(true);
    };
    
    const summaryCheckIns = bookings.filter(b => isSameDay(parseISO(b.checkInDate), summaryDate));
    const summaryCheckOuts = bookings.filter(b => isSameDay(parseISO(b.checkOutDate), summaryDate));
    const summaryInHouseGuests = bookings.filter(b => {
        const checkIn = parseISO(b.checkInDate);
        const checkOut = parseISO(b.checkOutDate);
        return summaryDate >= checkIn && summaryDate < checkOut;
    });

    const handleViewBooking = (booking: Booking) => {
        setEditingBooking(booking);
        setIsModalOpen(true);
    };

    const renderSummaryList = (bookingList: Booking[]) => {
        if (bookingList.length === 0) {
            return <p className="text-gray-500 italic p-4">{t('home.noGuests')}</p>;
        }
        return (
            <ul className="divide-y divide-gray-200">
                {bookingList.map(b => {
                    const room = rooms.find(r => r.id === b.roomId);
                    return (
                        <li 
                            key={b.id} 
                            className="p-4 hover:bg-yellow-50 cursor-pointer"
                            onClick={() => handleViewBooking(b)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sunriver-blue">{b.customerName}</p>
                                    <p className="text-sm text-gray-600">Room {room?.number} &bull; {b.phone}</p>
                                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                                        <p>
                                            <span className="font-medium">{t('home.checkIn')}:</span> {format(parseISO(b.checkInDate), 'dd MMM yyyy')}
                                        </p>
                                        <p>
                                            <span className="font-medium">{t('home.checkOut')}:</span> {format(parseISO(b.checkOutDate), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden md:block text-right">
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold py-1 px-3 rounded-full">
                                        {t('home.viewDetails')}
                                    </span>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        );
    }
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-sunriver-blue">{t('home.bookingOverview')}</h1>

            {/* Calendar */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-left"></i></button>
                    {/* FIX: Use imported locale objects instead of require. */}
                    <h2 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: language === 'th' ? th : enUS })}</h2>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-right"></i></button>
                    <button onClick={() => { setIsModalOpen(true); setSelectedDate(new Date()); setEditingBooking(null); }} className="bg-sunriver-yellow text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors hidden md:block">{t('home.addBooking')}</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600">
                    {weekdays.map(day => <div key={day} className="py-2">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                        const bookingsOnDay = getBookingsForDate(day);
                        const bookedCount = bookingsOnDay.length;
                        const vacantCount = rooms.length - bookedCount;
                        return (
                            <div key={i} onClick={() => handleDateClick(day)} className={`p-2 border rounded-md cursor-pointer transition-all h-24 md:h-32 flex flex-col justify-between ${!isSameMonth(day, currentMonth) ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-yellow-50'} ${isToday(day) ? 'border-2 border-sunriver-yellow' : 'border-gray-200'}`}>
                                <span className="font-semibold self-start">{format(day, 'd')}</span>
                                {isSameMonth(day, currentMonth) && (
                                    <div className="text-xs md:text-sm text-center">
                                        <div className="flex items-center justify-center space-x-1 text-green-600">
                                            <i className="fas fa-check-circle"></i> 
                                            <span className="font-bold">{vacantCount}</span>
                                            <span className="hidden lg:inline">{t('home.vacant')}</span>
                                        </div>
                                        <div className="flex items-center justify-center space-x-1 text-red-600">
                                            <i className="fas fa-times-circle"></i>
                                            <span className="font-bold">{bookedCount}</span>
                                            <span className="hidden lg:inline">{t('home.booked')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <button onClick={() => { setIsModalOpen(true); setSelectedDate(new Date()); setEditingBooking(null); }} className="bg-sunriver-yellow text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors w-full md:hidden fixed bottom-4 right-4 z-10 shadow-lg">{t('home.addBooking')}</button>

            {/* Daily Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                     <h2 className="text-xl font-semibold">{t('home.todaysSummary')}</h2>
                     <input
                        type="date"
                        value={format(summaryDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSummaryDate(e.target.value ? parseISO(e.target.value) : new Date())}
                        className="border-gray-300 rounded-md shadow-sm p-2 focus:border-sunriver-yellow focus:ring-sunriver-yellow mt-2 sm:mt-0"
                    />
                </div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 md:space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveSummaryTab('checkIn')} className={`${activeSummaryTab === 'checkIn' ? 'border-sunriver-yellow text-sunriver-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('home.checkIn')} ({summaryCheckIns.length})</button>
                        <button onClick={() => setActiveSummaryTab('checkOut')} className={`${activeSummaryTab === 'checkOut' ? 'border-sunriver-yellow text-sunriver-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('home.checkOut')} ({summaryCheckOuts.length})</button>
                        <button onClick={() => setActiveSummaryTab('inHouse')} className={`${activeSummaryTab === 'inHouse' ? 'border-sunriver-yellow text-sunriver-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('home.inHouse')} ({summaryInHouseGuests.length})</button>
                    </nav>
                </div>
                <div className="mt-4 max-h-60 overflow-y-auto">
                    {activeSummaryTab === 'checkIn' && renderSummaryList(summaryCheckIns)}
                    {activeSummaryTab === 'checkOut' && renderSummaryList(summaryCheckOuts)}
                    {activeSummaryTab === 'inHouse' && renderSummaryList(summaryInHouseGuests)}
                </div>
            </div>

            {isModalOpen && (
                <BookingForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    booking={editingBooking}
                    defaultDate={selectedDate}
                />
            )}
        </div>
    );
};

export default HomePage;
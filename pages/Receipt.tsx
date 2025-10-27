
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLanguage } from '../hooks/useLanguage';
import type { Booking } from '../types';
import ReceiptTemplate from '../components/ReceiptTemplate';

const ReceiptPage: React.FC = () => {
    const { bookings } = useAppContext();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());
    const [receiptBookings, setReceiptBookings] = useState<Booking[]>([]);

    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => b.createdAt - a.createdAt);
    }, [bookings]);
    
    const filteredBookings = useMemo(() => {
        if (!searchTerm) {
            return sortedBookings.slice(0, 10);
        }
        return sortedBookings.filter(b =>
            b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.phone.includes(searchTerm) ||
            b.checkInDate.includes(searchTerm) ||
            b.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, sortedBookings]);

    const handleSelectBooking = (bookingId: string) => {
        setSelectedBookingIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(bookingId)) {
                newSet.delete(bookingId);
            } else {
                newSet.add(bookingId);
            }
            return newSet;
        });
    };

    const handleGenerateReceipt = () => {
        if (selectedBookingIds.size === 0) {
            alert(t('receipt.noBookingSelected'));
            return;
        }
        const selected = sortedBookings.filter(b => selectedBookingIds.has(b.id));
        setReceiptBookings(selected);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full">
            <div className="lg:w-1/3 flex flex-col space-y-4">
                <h1 className="text-3xl font-bold text-sunriver-blue">{t('receipt.title')}</h1>
                <input
                    type="text"
                    placeholder={t('receipt.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-sunriver-yellow focus:border-sunriver-yellow"
                />
                <h2 className="text-xl font-semibold">{t('receipt.recentBookings')}</h2>
                <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow-sm border">
                    {filteredBookings.map(booking => (
                        <div key={booking.id} className="flex items-center p-2 border-b">
                            <input
                                type="checkbox"
                                checked={selectedBookingIds.has(booking.id)}
                                onChange={() => handleSelectBooking(booking.id)}
                                className="h-4 w-4 rounded border-gray-300 text-sunriver-yellow focus:ring-sunriver-yellow"
                            />
                            <div className="ml-3">
                                <p className="font-semibold">{booking.customerName}</p>
                                <p className="text-sm text-gray-500">{booking.id} - {booking.checkInDate}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleGenerateReceipt}
                    className="w-full bg-sunriver-yellow text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                    {t('receipt.generateReceipt')}
                </button>
            </div>
            <div className="lg:w-2/3 flex flex-col">
                <h2 className="text-xl font-semibold mb-4">{t('receipt.preview')}</h2>
                <div className="flex-1 bg-white p-2 rounded-lg shadow-inner border overflow-y-auto">
                    {receiptBookings.length > 0 ? (
                        <ReceiptTemplate bookings={receiptBookings} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            {t('receipt.noBookingSelected')}
                        </div>
                    )}
                </div>
                 {receiptBookings.length > 0 && 
                    <button onClick={() => window.print()} className="mt-4 print:hidden bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        {t('receipt.print')}
                    </button>
                }
            </div>
        </div>
    );
};

export default ReceiptPage;

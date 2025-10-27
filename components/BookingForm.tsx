
import React, { useState, useEffect } from 'react';
import { format, parseISO, isBefore } from 'date-fns';
import { useAppContext } from '../hooks/useAppContext';
import { useLanguage } from '../hooks/useLanguage';
import type { Booking, BookingStatus } from '../types';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  defaultDate?: Date | null;
  defaultRoomId?: number | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, booking, defaultDate, defaultRoomId }) => {
  const { rooms, bookings, addBooking, updateBooking } = useAppContext();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    checkInDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '',
    checkOutDate: defaultDate ? format(new Date(defaultDate.getTime() + 86400000), 'yyyy-MM-dd') : '',
    roomId: defaultRoomId || 0,
    status: 'Unpaid' as BookingStatus,
    deposit: 0,
    pricePerNight: 800,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customerName,
        phone: booking.phone,
        email: booking.email || '',
        address: booking.address || '',
        taxId: booking.taxId || '',
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        roomId: booking.roomId,
        status: booking.status,
        deposit: booking.deposit,
        pricePerNight: booking.pricePerNight,
      });
    } else {
       setFormData(prev => ({
           ...prev,
           checkInDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '',
           checkOutDate: defaultDate ? format(new Date(defaultDate.getTime() + 86400000), 'yyyy-MM-dd') : '',
           roomId: defaultRoomId || (rooms.length > 0 ? rooms[0].id : 0),
       }));
    }
  }, [booking, defaultDate, defaultRoomId, rooms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'roomId' || name === 'deposit' || name === 'pricePerNight' ? Number(value) : value }));
  };
  
  const isRoomAvailable = () => {
    if (!formData.checkInDate || !formData.checkOutDate || !formData.roomId) return true;
    const start = parseISO(formData.checkInDate);
    const end = parseISO(formData.checkOutDate);
    return !bookings.some(b => 
        b.roomId === formData.roomId &&
        (booking ? b.id !== booking.id : true) &&
        (start < parseISO(b.checkOutDate) && end > parseISO(b.checkInDate))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isBefore(parseISO(formData.checkOutDate), parseISO(formData.checkInDate))) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    if (!isRoomAvailable()) {
        setError(t('bookingForm.roomIsBooked'));
        return;
    }

    const bookingData = {
        ...formData,
        deposit: formData.status === 'Deposit' ? formData.deposit : 0
    };

    if (booking) {
      updateBooking({ ...booking, ...bookingData });
    } else {
      addBooking(bookingData);
    }
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{booking ? t('bookingForm.editBooking') : t('bookingForm.newBooking')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('bookingForm.customerName')}</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('bookingForm.phone')}</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('bookingForm.checkInDate')}</label>
              <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('bookingForm.checkOutDate')}</label>
              <input type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
             <div>
              <label className="block text-sm font-medium">{t('bookingForm.room')}</label>
              <select name="roomId" value={formData.roomId} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                {rooms.map(room => <option key={room.id} value={room.id}>{room.number} - {room.type} ({room.bedType})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">{t('bookingForm.bookingStatus')}</label>
              <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                <option value="Unpaid">{t('bookingForm.unpaid')}</option>
                <option value="Deposit">{t('bookingForm.deposit')}</option>
                <option value="Paid">{t('bookingForm.paid')}</option>
              </select>
            </div>
          </div>
          {/* Optional Fields */}
          {formData.status === 'Deposit' && (
            <div>
              <label className="block text-sm font-medium">{t('bookingForm.depositAmount')}</label>
              <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">{t('bookingForm.pricePerNight')}</label>
            <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('bookingForm.email')}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('bookingForm.taxId')}</label>
              <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
          <div>
              <label className="block text-sm font-medium">{t('bookingForm.address')}</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">{t('bookingForm.cancel')}</button>
            <button type="submit" className="bg-sunriver-yellow text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-500">{t('bookingForm.saveBooking')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;

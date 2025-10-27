
import React from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useLanguage } from '../hooks/useLanguage';
import { useAppContext } from '../hooks/useAppContext';
import type { Booking } from '../types';

interface ReceiptTemplateProps {
  bookings: Booking[];
}

const logoSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAeNSURBVНомер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";
const hotelInfo = {
    nameTh: 'ห้างหุ้นส่วนจำกัด ซันริเวอร์โฮเทล',
    nameEn: 'Sunriver Hotel Limited Partnership',
    addressTh: '215 หมู่ 1 ถนนอภิบาลบัญชา ตำบลท่าอุเทน อำเภอท่าอุเทน จังหวัดนครพนม 48120',
    addressEn: '215 Moo 1, Apibanbancha Rd., Tha Uthen, Tha Uthen, Nakhon Phanom 48120',
    phone: '093-152-9564',
    taxId: '0483568000055'
};

const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ bookings }) => {
    const { t, language } = useLanguage();
    const { rooms } = useAppContext();
    if (bookings.length === 0) return null;

    const mainBooking = bookings[0];
    const totalAmount = bookings.reduce((sum, b) => {
        const nights = differenceInDays(parseISO(b.checkOutDate), parseISO(b.checkInDate));
        return sum + nights * b.pricePerNight;
    }, 0);

    return (
        <div id="receipt-content" className="p-4 md:p-8 bg-white text-black font-['Tahoma'] w-[210mm] min-h-[297mm] mx-auto">
            <div className="relative border-b-4 border-sunriver-yellow pb-4">
                <div className="absolute -top-8 -left-8 w-full h-32 bg-sunriver-yellow/20 rounded-br-full -z-0"></div>
                <div className="absolute bottom-0 -right-8 w-full h-32 bg-sunriver-yellow/20 rounded-tl-full -z-0"></div>
                
                <header className="flex justify-between items-start relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold">{language === 'th' ? 'โรงแรมซันริเวอร์' : 'Sunriver Hotel'}</h1>
                        <p className="text-xs">{language === 'th' ? hotelInfo.nameTh : hotelInfo.nameEn}</p>
                        <p className="text-xs">{language === 'th' ? hotelInfo.addressTh : hotelInfo.addressEn}</p>
                        <p className="text-xs">{language === 'th' ? 'โทร' : 'Tel'}: {hotelInfo.phone}</p>
                        <p className="text-xs">{language === 'th' ? 'เลขประจำตัวผู้เสียภาษี' : 'Tax ID'}: {hotelInfo.taxId}</p>
                    </div>
                    <div className="text-right">
                        <img src="https://i.imgur.com/8Fk5g3L.png" alt="Sunriver Logo" className="w-24 h-auto ml-auto mb-2"/>
                        <h2 className="text-3xl font-bold">{t('receipt.receiptTitle')}</h2>
                    </div>
                </header>
            </div>

            <section className="mt-6 flex justify-between text-sm">
                <div className="w-2/3 pr-4">
                    <p><strong>{t('receipt.customerName')}:</strong> {mainBooking.customerName}</p>
                    <p><strong>{t('receipt.address')}:</strong> {mainBooking.address || 'N/A'}</p>
                    <p><strong>{t('receipt.tel')}:</strong> {mainBooking.phone}</p>
                    <p><strong>{t('receipt.taxId')}:</strong> {mainBooking.taxId || 'N/A'}</p>
                </div>
                <div>
                    <p><strong>{t('receipt.receiptNo')}:</strong> {mainBooking.id}</p>
                    <p><strong>{t('receipt.date')}:</strong> {format(new Date(), 'dd/MM/yyyy')}</p>
                </div>
            </section>

            <section className="mt-6">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-sunriver-yellow/30">
                        <tr className="border-y-2 border-black">
                            <th className="p-2 text-left font-bold">{t('receipt.description')}</th>
                            <th className="p-2 text-center font-bold">{t('receipt.noOfNights')}</th>
                            <th className="p-2 text-right font-bold">{t('receipt.unitPrice')}</th>
                            <th className="p-2 text-right font-bold">{t('receipt.total')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => {
                            const room = rooms.find(r => r.id === b.roomId);
                            const nights = differenceInDays(parseISO(b.checkOutDate), parseISO(b.checkInDate));
                            const total = nights * b.pricePerNight;
                            return (
                                <tr key={b.id} className="border-b border-gray-300">
                                    <td className="p-2 align-top">
                                        <p className="font-semibold">{t('receipt.roomBooking')} {room?.number}</p>
                                        <p className="text-xs text-gray-600">{t('receipt.checkIn')}: {format(parseISO(b.checkInDate), 'dd/MM/yyyy')} - {t('receipt.checkOut')}: {format(parseISO(b.checkOutDate), 'dd/MM/yyyy')}</p>
                                    </td>
                                    <td className="p-2 text-center align-top">{nights}</td>
                                    <td className="p-2 text-right align-top">{b.pricePerNight.toFixed(2)}</td>
                                    <td className="p-2 text-right align-top">{total.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>
            
            <div className="h-24"></div>

            <section className="mt-6 flex justify-end">
                <div className="w-1/2">
                    <div className="flex justify-between items-center p-2 bg-sunriver-yellow/30 border-y-2 border-black">
                        <strong className="text-md">{t('receipt.totalAmount')}</strong>
                        <strong className="text-md">{totalAmount.toFixed(2)}</strong>
                    </div>
                </div>
            </section>
            
            <div className="flex-grow"></div>

            <footer className="mt-auto pt-8 text-sm">
                <div className="flex justify-between">
                    <div>
                        <p className="font-bold mb-2">{t('receipt.remarks')}:</p>
                    </div>
                    <div className="w-1/3 text-center">
                        <div className="border-b border-dotted border-black h-12"></div>
                        <p className="mt-2">({t('receipt.authorizedSignature')})</p>
                    </div>
                </div>
                 <div className="mt-4 border-t-2 border-sunriver-yellow text-center text-xs pt-2">
                    <p>{hotelInfo.phone} | {language === 'th' ? hotelInfo.addressTh : hotelInfo.addressEn}</p>
                </div>
            </footer>
        </div>
    );
};

export default ReceiptTemplate;

import React from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useLanguage } from '../hooks/useLanguage';
import { useAppContext } from '../hooks/useAppContext';
import type { Booking, RoomType, BedType } from '../types';

interface ReceiptTemplateProps {
  bookings: Booking[];
}

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
                        <img src="/logo.png" alt="Sunriver Logo" className="w-24 h-auto ml-auto mb-2"/>
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
                            
                            let description = '';
                            if (room) {
                                const roomTypeToKey: Record<RoomType, string> = {
                                    'River view': 'riverView',
                                    'Standard view': 'standardView',
                                    'Cottage': 'cottage'
                                };
                                const bedTypeToKey: Record<BedType, string> = {
                                    'Double bed': 'doubleBed',
                                    'Twin bed': 'twinBed'
                                };
                                
                                const roomTypeKey = roomTypeToKey[room.type];
                                const bedTypeKey = bedTypeToKey[room.bedType];
                                
                                const translatedRoomType = t(`roomTypes.${roomTypeKey}`);
                                const translatedBedType = t(`bedTypes.${bedTypeKey}`);
                                
                                if (room.type === 'Cottage') {
                                    description = translatedRoomType;
                                } else {
                                    description = `${translatedRoomType} (${translatedBedType})`;
                                }
                            }

                            return (
                                <tr key={b.id} className="border-b border-gray-300">
                                    <td className="p-2 align-top">
                                        <p className="font-semibold">{description || `${t('receipt.roomBooking')} ${room?.number}`}</p>
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
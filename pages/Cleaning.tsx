import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useLanguage } from '../hooks/useLanguage';
import ConfirmationModal from '../components/ConfirmationModal';
import { isToday, parseISO } from 'date-fns';
import type { CleaningStatusValue } from '../types';

const CleaningPage: React.FC = () => {
    const { rooms, cleaningStatuses, updateCleaningStatus, bookings } = useAppContext();
    const { t } = useLanguage();
    const [modalInfo, setModalInfo] = useState<{
        isOpen: boolean;
        roomId: number | null;
        newStatus: CleaningStatusValue | null;
    }>({ isOpen: false, roomId: null, newStatus: null });

    const handleStatusToggle = (roomId: number, currentStatus: CleaningStatusValue) => {
        const newStatus = currentStatus === 'Clean' ? 'Needs Cleaning' : 'Clean';
        setModalInfo({ isOpen: true, roomId, newStatus });
    };

    const handleConfirmStatusChange = () => {
        if (modalInfo.roomId !== null && modalInfo.newStatus) {
            updateCleaningStatus(modalInfo.roomId, modalInfo.newStatus);
        }
        setModalInfo({ isOpen: false, roomId: null, newStatus: null });
    };

    const getOccupancyStatus = (roomId: number) => {
        const today = new Date();
        const statuses = [];
        
        const isCheckingIn = bookings.some(b => b.roomId === roomId && isToday(parseISO(b.checkInDate)));
        if (isCheckingIn) statuses.push(t('cleaning.checkingIn'));
        
        const isCheckingOut = bookings.some(b => b.roomId === roomId && isToday(parseISO(b.checkOutDate)));
        if (isCheckingOut) statuses.push(t('cleaning.checkingOut'));

        const isInHouse = bookings.some(b => {
            const checkIn = parseISO(b.checkInDate);
            const checkOut = parseISO(b.checkOutDate);
            return b.roomId === roomId && today >= checkIn && today < checkOut && !isToday(checkIn)
        });
        if (isInHouse) statuses.push(t('cleaning.inHouse'));
        
        if (statuses.length === 0) return t('cleaning.vacant');

        return statuses.join(' & ');
    }

    const getModalTitle = () => {
        if (modalInfo.newStatus === 'Clean') {
            return t('cleaning.confirmTitle');
        }
        return t('cleaning.confirmMarkDirtyTitle');
    };
    
    const getModalMessage = () => {
        if (modalInfo.newStatus === 'Clean') {
            return t('cleaning.confirmMessage');
        }
        return t('cleaning.confirmMarkDirtyMessage');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-sunriver-blue">{t('cleaning.title')}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {rooms.map(room => {
                    const cleaningStatus = cleaningStatuses.find(cs => cs.roomId === room.id);
                    const currentStatus = cleaningStatus?.status || 'Clean';
                    const isClean = currentStatus === 'Clean';
                    const occupancy = getOccupancyStatus(room.id);
                    return (
                        <div 
                            key={room.id} 
                            onClick={() => handleStatusToggle(room.id, currentStatus)}
                            className={`p-4 rounded-lg shadow-lg flex flex-col justify-between transition-all duration-300 cursor-pointer ${isClean ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}>
                            <div>
                                <div className="flex justify-between items-center">
                                    <p className="text-2xl font-bold text-sunriver-blue">{room.number}</p>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isClean ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {isClean ? t('cleaning.clean') : t('cleaning.needsCleaning')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{t('cleaning.status')}: <span className="font-medium text-gray-700">{occupancy}</span></p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ConfirmationModal
                isOpen={modalInfo.isOpen}
                onClose={() => setModalInfo({ isOpen: false, roomId: null, newStatus: null })}
                onConfirm={handleConfirmStatusChange}
                title={getModalTitle()}
                message={getModalMessage()}
            />
        </div>
    );
};

export default CleaningPage;